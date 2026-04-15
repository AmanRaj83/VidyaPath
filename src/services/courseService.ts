/**
 * courseService.ts
 * Files (videos/images) → Cloudinary (free, no billing needed)
 * Course metadata        → Firebase Firestore
 */
import {
  collection, doc, addDoc, getDoc, getDocs,
  query, where, orderBy, deleteDoc, Timestamp, serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

const CLOUDINARY_CLOUD   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME  as string;
const CLOUDINARY_PRESET  = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

// ─────────────────────────────────────────────
//  Shared Types  (same shape as before)
// ─────────────────────────────────────────────

export interface Course {
  id: string;
  teacher_uid: string;
  teacher_name: string;
  teacher_photo_url: string | null;
  title: string;
  description: string;
  subject: string;
  class_level: number;
  thumbnail_url: string | null;
  is_free: boolean;
  level: string;
  total_duration: string;
  created_at: string;
}

export interface QuizQuestion {
  question: string;
  options: [string, string, string, string];
  correctAnswer: number; // 0–3 index
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  type: "video" | "reading" | "quiz";
  video_url: string | null;
  pdf_url: string | null;
  content: string | null;
  duration: string;
  order: number;
  questions?: QuizQuestion[];
  created_at: string;
}

export type CourseWithLessons = Course & { lessons: Lesson[] };

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

/** Convert a Firestore doc snapshot to a typed Course */
function toCourse(id: string, data: DocumentData): Course {
  return {
    id,
    teacher_uid:      data.teacher_uid      ?? "",
    teacher_name:     data.teacher_name     ?? "Teacher",
    teacher_photo_url: data.teacher_photo_url ?? null,
    title:            data.title            ?? "",
    description:      data.description      ?? "",
    subject:          data.subject          ?? "",
    class_level:      data.class_level      ?? 6,
    thumbnail_url:    data.thumbnail_url    ?? null,
    is_free:          data.is_free          ?? true,
    level:            data.level            ?? "Beginner",
    total_duration:   data.total_duration   ?? "—",
    created_at:       data.created_at instanceof Timestamp
      ? data.created_at.toDate().toISOString()
      : data.created_at ?? new Date().toISOString(),
  };
}

/** Convert a Firestore doc snapshot to a typed Lesson */
function toLesson(id: string, data: DocumentData): Lesson {
  return {
    id,
    course_id:  data.course_id  ?? "",
    title:      data.title      ?? "",
    type:       data.type       ?? "video",
    video_url:  data.video_url  ?? null,
    pdf_url:    data.pdf_url    ?? null,
    content:    data.content    ?? null,
    duration:   data.duration   ?? "—",
    order:      data.order      ?? 1,
    questions:  Array.isArray(data.questions) ? data.questions as QuizQuestion[] : undefined,
    created_at: data.created_at instanceof Timestamp
      ? data.created_at.toDate().toISOString()
      : data.created_at ?? new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────
//  Cloudinary Upload (with XHR progress)
// ─────────────────────────────────────────────

/**
 * Cloudinary response shape (partial).
 */
interface CloudinaryResponse {
  secure_url: string;
  url: string;
  resource_type: "image" | "video" | "raw";
  format: string;
  public_id: string;
  version: number;
  error?: { message: string };
}

/**
 * Build the correct delivery URL from a Cloudinary response.
 * For PDFs stored as 'image' type, we add fl_attachment so the
 * browser downloads the actual PDF bytes instead of a rendered image.
 * For 'raw' type, we use the secure_url directly.
 */
function buildCloudinaryUrl(res: CloudinaryResponse): string {
  const isPdf = res.format === "pdf" || res.public_id.endsWith(".pdf");

  if (isPdf && res.resource_type === "image") {
    // image/upload URL won't serve PDF bytes — add fl_attachment transformation
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/fl_attachment/v${res.version}/${res.public_id}.pdf`;
  }

  if (isPdf && res.resource_type === "raw") {
    // raw/upload URLs are served directly — just ensure .pdf extension
    const base = `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/raw/upload/v${res.version}/${res.public_id}`;
    return res.public_id.endsWith(".pdf") ? base : `${base}.pdf`;
  }

  // Images and videos — use secure_url as-is
  return res.secure_url;
}

export function uploadFile(
  file: File,
  _path: string,
  onProgress?: (pct: number) => void,
  resourceType: "image" | "video" | "raw" | "auto" = "auto",
): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/${resourceType}/upload`,
    );

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress?.(pct);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const res: CloudinaryResponse = JSON.parse(xhr.responseText);
        // Log for debugging
        console.log("[Cloudinary] Upload response:", {
          resource_type: res.resource_type,
          format: res.format,
          public_id: res.public_id,
          version: res.version,
          secure_url: res.secure_url,
        });
        resolve(buildCloudinaryUrl(res));
      } else {
        let errMsg = xhr.statusText;
        try {
          errMsg = JSON.parse(xhr.responseText)?.error?.message ?? errMsg;
        } catch { /* ignore parse errors */ }
        reject(new Error(`Cloudinary upload failed: ${errMsg}`));
      }
    });

    xhr.addEventListener("error", () =>
      reject(new Error("Network error during upload. Check your connection."))
    );

    xhr.send(formData);
  });
}


// ─────────────────────────────────────────────
//  Firestore — Courses
// ─────────────────────────────────────────────

/** Fetch all courses with their lessons (for students) */
export async function fetchAllCourses(): Promise<CourseWithLessons[]> {
  // 1. Get all courses ordered by newest first
  const coursesSnap = await getDocs(
    query(collection(db, "courses"), orderBy("created_at", "desc"))
  );
  const courses = coursesSnap.docs.map((d) => toCourse(d.id, d.data()));

  if (courses.length === 0) return [];

  // 2. Get all lessons in one round-trip, group by course_id
  const lessonsSnap = await getDocs(collection(db, "lessons"));
  const allLessons = lessonsSnap.docs.map((d) => toLesson(d.id, d.data()));

  return courses.map((course) => ({
    ...course,
    lessons: allLessons
      .filter((l) => l.course_id === course.id)
      .sort((a, b) => a.order - b.order),
  }));
}

/** Fetch courses uploaded by a specific teacher */
export async function fetchTeacherCourses(
  teacherUid: string,
): Promise<CourseWithLessons[]> {
  // Only use `where` — avoid composite index requirement from where+orderBy combo
  const coursesSnap = await getDocs(
    query(
      collection(db, "courses"),
      where("teacher_uid", "==", teacherUid),
    )
  );

  // Sort newest-first client-side
  const courses = coursesSnap.docs
    .map((d) => toCourse(d.id, d.data()))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (courses.length === 0) return [];

  // Fetch lessons for all teacher's courses in one query
  const lessonsSnap = await getDocs(
    query(collection(db, "lessons"), where("course_id", "in", courses.map((c) => c.id)))
  );
  const allLessons = lessonsSnap.docs.map((d) => toLesson(d.id, d.data()));

  return courses.map((course) => ({
    ...course,
    lessons: allLessons
      .filter((l) => l.course_id === course.id)
      .sort((a, b) => a.order - b.order),
  }));
}

/** Fetch a single course with its lessons */
export async function fetchCourseById(
  id: string,
): Promise<CourseWithLessons | null> {
  const courseSnap = await getDoc(doc(db, "courses", id));
  if (!courseSnap.exists()) return null;

  const course = toCourse(courseSnap.id, courseSnap.data());

  const lessonsSnap = await getDocs(
    query(collection(db, "lessons"), where("course_id", "==", id))
  );
  const lessons = lessonsSnap.docs
    .map((d) => toLesson(d.id, d.data()))
    .sort((a, b) => a.order - b.order);

  return { ...course, lessons };
}

/** Create a new course document */
export async function createCourse(
  payload: Omit<Course, "id" | "created_at">,
): Promise<Course> {
  const ref = await addDoc(collection(db, "courses"), {
    ...payload,
    created_at: serverTimestamp(),
  });
  return {
    ...payload,
    id: ref.id,
    created_at: new Date().toISOString(),
  };
}

/** Delete a course document (lessons must be deleted separately or via Cloud Function) */
export async function deleteCourse(id: string): Promise<void> {
  // Delete all lessons for this course first
  const lessonsSnap = await getDocs(
    query(collection(db, "lessons"), where("course_id", "==", id))
  );
  await Promise.all(lessonsSnap.docs.map((d) => deleteDoc(d.ref)));
  // Then delete the course
  await deleteDoc(doc(db, "courses", id));
}

// ─────────────────────────────────────────────
//  Firestore — Lessons
// ─────────────────────────────────────────────

/** Add a lesson to an existing course */
export async function createLesson(
  payload: Omit<Lesson, "id" | "created_at">,
): Promise<Lesson> {
  const ref = await addDoc(collection(db, "lessons"), {
    ...payload,
    created_at: serverTimestamp(),
  });
  return {
    ...payload,
    id: ref.id,
    created_at: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────
//  High-level: Upload course with one video lesson
// ─────────────────────────────────────────────

export interface UploadCoursePayload {
  teacherUid: string;
  teacherName: string;
  teacherPhotoUrl: string | null;
  title: string;
  description: string;
  subject: string;
  classLevel: number;
  level: string;
  isFree: boolean;
  thumbnailFile: File | null;
  videoFile: File | null;
  pdfFile: File | null;
  lessonTitle: string;
  lessonContent: string;
  onProgress?: (stage: string, pct: number) => void;
}

export async function uploadCourseWithLesson(
  payload: UploadCoursePayload,
): Promise<CourseWithLessons> {
  const {
    teacherUid, teacherName, teacherPhotoUrl,
    title, description, subject, classLevel, level,
    isFree, thumbnailFile, videoFile, pdfFile, lessonTitle, lessonContent, onProgress,
  } = payload;

  // 1. Upload thumbnail → Cloudinary image
  let thumbnailUrl: string | null = null;
  if (thumbnailFile) {
    onProgress?.("Uploading thumbnail…", 0);
    thumbnailUrl = await uploadFile(
      thumbnailFile,
      "",
      (pct) => onProgress?.("Uploading thumbnail…", pct),
      "image",
    );
  }

  // 2. Create course document in Firestore
  onProgress?.("Saving course details…", 0);
  const course = await createCourse({
    teacher_uid:      teacherUid,
    teacher_name:     teacherName,
    teacher_photo_url: teacherPhotoUrl,
    title,
    description,
    subject,
    class_level:   classLevel,
    level,
    is_free:       isFree,
    thumbnail_url: thumbnailUrl,
    total_duration: "—",
  });

  // 3. Upload video → Cloudinary video
  let videoUrl: string | null = null;
  if (videoFile) {
    onProgress?.("Uploading video…", 0);
    videoUrl = await uploadFile(
      videoFile,
      "",
      (pct) => onProgress?.("Uploading video…", pct),
      "video",
    );
  }

  // 4. Upload PDF → Cloudinary (auto-detect, handles PDF correctly)
  let pdfUrl: string | null = null;
  if (pdfFile) {
    onProgress?.("Uploading PDF…", 0);
    pdfUrl = await uploadFile(
      pdfFile,
      "",
      (pct) => onProgress?.("Uploading PDF…", pct),
      "auto",
    );
  }

  // 5. Determine lesson type
  const lessonType = videoUrl ? "video" : pdfUrl ? "reading" : "reading";

  // 6. Create lesson document in Firestore
  onProgress?.("Saving lesson…", 100);
  const lesson = await createLesson({
    course_id: course.id,
    title:     lessonTitle,
    type:      lessonType,
    video_url: videoUrl,
    pdf_url:   pdfUrl,
    content:   lessonContent,
    duration:  "—",
    order:     1,
  });

  return { ...course, lessons: [lesson] };
}

// ─────────────────────────────────────────────
//  High-level: Add a lesson to an existing course
// ─────────────────────────────────────────────

export interface AddLessonPayload {
  courseId: string;
  title: string;
  content: string;
  videoFile: File | null;
  pdfFile: File | null;
  questions?: QuizQuestion[];
  order: number;
  onProgress?: (stage: string, pct: number) => void;
}

export async function addLessonToCourse(payload: AddLessonPayload): Promise<Lesson> {
  const { courseId, title, content, videoFile, pdfFile, questions, order, onProgress } = payload;

  // Quiz lesson — no file uploads needed
  if (questions && questions.length > 0) {
    return createLesson({
      course_id: courseId,
      title,
      type: "quiz",
      video_url: null,
      pdf_url: null,
      content,
      duration: "—",
      order,
      questions,
    });
  }

  let videoUrl: string | null = null;
  if (videoFile) {
    onProgress?.("Uploading video…", 0);
    videoUrl = await uploadFile(videoFile, "", (pct) => onProgress?.("Uploading video…", pct), "video");
  }

  let pdfUrl: string | null = null;
  if (pdfFile) {
    onProgress?.("Uploading PDF…", 0);
    pdfUrl = await uploadFile(pdfFile, "", (pct) => onProgress?.("Uploading PDF…", pct), "auto");
  }

  return createLesson({
    course_id: courseId,
    title,
    type:      videoUrl ? "video" : "reading",
    video_url: videoUrl,
    pdf_url:   pdfUrl,
    content,
    duration:  "—",
    order,
  });
}
