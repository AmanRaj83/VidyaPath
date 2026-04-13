// ─── Offline Storage Utility ─────────────────────────────────────────────────
// Saves lesson content to localStorage so it can be read without internet.
// Storage key format: vidyapath-offline-lesson-{lessonId}

const OFFLINE_PREFIX = "vidyapath-offline-lesson-";
const OFFLINE_INDEX_KEY = "vidyapath-offline-index";

export interface OfflineLesson {
  lessonId: string;
  courseId: string;
  courseTitle: string;
  lessonTitle: string;
  content: string;
  type: string;
  duration: string;
  savedAt: string;
}

/** Returns the list of all offline-saved lesson IDs */
export const getOfflineIndex = (): string[] => {
  const stored = localStorage.getItem(OFFLINE_INDEX_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveOfflineIndex = (ids: string[]) => {
  localStorage.setItem(OFFLINE_INDEX_KEY, JSON.stringify(ids));
};

/** Returns true if a specific lesson is saved offline */
export const isLessonOffline = (lessonId: string): boolean => {
  return getOfflineIndex().includes(lessonId);
};

/** Saves a lesson for offline use. Returns true on success. */
export const saveOfflineLesson = (lesson: OfflineLesson): boolean => {
  try {
    localStorage.setItem(
      `${OFFLINE_PREFIX}${lesson.lessonId}`,
      JSON.stringify(lesson)
    );
    const index = getOfflineIndex();
    if (!index.includes(lesson.lessonId)) {
      saveOfflineIndex([...index, lesson.lessonId]);
    }
    return true;
  } catch {
    // localStorage might be full (rare on modern devices)
    return false;
  }
};

/** Retrieves a saved offline lesson. Returns null if not found. */
export const getOfflineLesson = (lessonId: string): OfflineLesson | null => {
  const stored = localStorage.getItem(`${OFFLINE_PREFIX}${lessonId}`);
  return stored ? JSON.parse(stored) : null;
};

/** Removes a specific lesson from offline storage */
export const removeOfflineLesson = (lessonId: string): void => {
  localStorage.removeItem(`${OFFLINE_PREFIX}${lessonId}`);
  const index = getOfflineIndex().filter((id) => id !== lessonId);
  saveOfflineIndex(index);
};

/** Returns all offline saved lessons for a course */
export const getOfflineLessonsForCourse = (courseId: string): OfflineLesson[] => {
  const index = getOfflineIndex();
  return index
    .map((id) => getOfflineLesson(id))
    .filter((l): l is OfflineLesson => l !== null && l.courseId === courseId);
};

/** Returns total number of offline-saved lessons */
export const getOfflineCount = (): number => {
  return getOfflineIndex().length;
};
