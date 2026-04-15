import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, BookOpen, Video, FileText, HelpCircle,
  CheckCircle2, Circle, Volume2, WifiOff,
  Download, Trash2, CheckCheck, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  quizData, getStoredProgress, saveProgress,
  addXP, updateStreak, getStoredBadges, saveBadges,
} from "@/data/courses";
import { fetchCourseById, type CourseWithLessons, type Lesson } from "@/services/courseService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useOffline } from "@/hooks/useOffline";
import {
  isLessonOffline, saveOfflineLesson, removeOfflineLesson,
  getOfflineLessonsForCourse,
} from "@/lib/offlineStorage";

const lessonIcons: Record<string, React.ElementType> = {
  video: Video,
  reading: FileText,
  quiz: HelpCircle,
};

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { isOnline, isOffline } = useOffline();

  const [course, setCourse] = useState<CourseWithLessons | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [quizState, setQuizState] = useState<{
    currentQ: number; answers: number[]; submitted: boolean;
  } | null>(null);
  const [offlineLessons, setOfflineLessons] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState<string | null>(null);

  // Load course from Supabase
  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    fetchCourseById(courseId)
      .then((data) => {
        setCourse(data);
        // Load stored progress
        const progress = getStoredProgress();
        const courseProgress = progress.find((p) => p.courseId === courseId);
        if (courseProgress) setCompletedLessons(courseProgress.completedLessons);
        // Load offline lesson index
        const saved = getOfflineLessonsForCourse(courseId);
        setOfflineLessons(new Set(saved.map((l) => l.lessonId)));
      })
      .catch(() => toast.error("Failed to load course."))
      .finally(() => setLoading(false));
  }, [courseId]);

  // ── Loading State ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // ── Not Found ────────────────────────────────────────────────────────────────
  if (!course) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Course not found</h1>
          <Link to="/courses" className="mt-4 inline-block text-primary hover:underline">
            Back to courses
          </Link>
        </div>
      </div>
    );
  }

  const lessons = course.lessons ?? [];
  // Sort by order field
  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);

  const completionPercent = lessons.length > 0
    ? (completedLessons.length / lessons.length) * 100
    : 0;
  const activeL = sortedLessons.find((l) => l.id === activeLesson);

  // ── Mark lesson complete ─────────────────────────────────────────────────────
  const markComplete = (lessonId: string) => {
    if (completedLessons.includes(lessonId)) return;
    const updated = [...completedLessons, lessonId];
    setCompletedLessons(updated);

    const progress = getStoredProgress();
    const idx = progress.findIndex((p) => p.courseId === course.id);
    if (idx >= 0) {
      // Preserve existing quizScores — only update completedLessons + lastAccessed
      progress[idx] = {
        ...progress[idx],
        completedLessons: updated,
        lastAccessed: new Date().toISOString(),
      };
    } else {
      progress.push({
        courseId: course.id,
        completedLessons: updated,
        quizScores: [],
        lastAccessed: new Date().toISOString(),
      });
    }
    saveProgress(progress);

    addXP(10);
    updateStreak();
    toast.success("Lesson completed! +10 XP 🎉");

    const badges = getStoredBadges();
    const firstLesson = badges.find((b) => b.id === "first-lesson");
    if (firstLesson && !firstLesson.earned) {
      firstLesson.earned = true;
      firstLesson.earnedDate = new Date().toISOString();
      saveBadges(badges);
      toast("🌱 Badge earned: First Step!");
    }
    if (updated.length === lessons.length) {
      const courseBadge = badges.find((b) => b.id === "course-complete");
      if (courseBadge && !courseBadge.earned) {
        courseBadge.earned = true;
        courseBadge.earnedDate = new Date().toISOString();
        saveBadges(badges);
        toast("🎓 Badge earned: Course Champion!");
      }
    }
  };

  // ── Save quiz score to progress ────────────────────────────────────────────────
  const saveQuizScore = (lessonId: string, correct: number, total: number) => {
    const progress = getStoredProgress();
    const idx = progress.findIndex((p) => p.courseId === course.id);
    const newScore = { lessonId, score: correct, total };
    if (idx >= 0) {
      const existing = progress[idx].quizScores ?? [];
      const si = existing.findIndex((s) => s.lessonId === lessonId);
      if (si >= 0) existing[si] = newScore;
      else existing.push(newScore);
      progress[idx] = { ...progress[idx], quizScores: existing };
    } else {
      progress.push({
        courseId: course.id,
        completedLessons: [],
        quizScores: [newScore],
        lastAccessed: new Date().toISOString(),
      });
    }
    saveProgress(progress);
  };

  // ── Quiz submit ───────────────────────────────────────────────────────────────
  const handleQuizSubmit = () => {
    if (!quizState || !activeLesson) return;
    const activeL = lessons.find((l) => l.id === activeLesson);
    const quiz = activeL?.questions;
    if (!quiz || quiz.length === 0) return;
    let correct = 0;
    quizState.answers.forEach((a, i) => {
      if (a === quiz[i].correctAnswer) correct++;
    });
    setQuizState({ ...quizState, submitted: true });
    const score = Math.round((correct / quiz.length) * 100);
    addXP(correct * 5);
    toast.success(`Quiz score: ${correct}/${quiz.length} (${score}%) — +${correct * 5} XP`);

    // ✅ Persist score so it appears on the student dashboard
    saveQuizScore(activeLesson, correct, quiz.length);

    if (correct === quiz.length) {
      const badges = getStoredBadges();
      const qm = badges.find((b) => b.id === "quiz-master");
      if (qm && !qm.earned) {
        qm.earned = true;
        qm.earnedDate = new Date().toISOString();
        saveBadges(badges);
        toast("🏆 Badge earned: Quiz Master!");
      }
    }
    markComplete(activeLesson);
  };

  // ── Text to speech ────────────────────────────────────────────────────────────
  const speakText = (text: string) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    speechSynthesis.speak(utterance);
  };

  // ── Download / Remove offline lesson ─────────────────────────────────────────
  const handleDownload = async (lesson: Lesson) => {
    if (offlineLessons.has(lesson.id)) {
      removeOfflineLesson(lesson.id);
      setOfflineLessons((prev) => {
        const next = new Set(prev);
        next.delete(lesson.id);
        return next;
      });
      toast("🗑️ Removed from offline storage.");
      return;
    }

    setDownloading(lesson.id);
    await new Promise((r) => setTimeout(r, 400));

    const success = saveOfflineLesson({
      lessonId: lesson.id,
      courseId: course.id,
      courseTitle: course.title,
      lessonTitle: lesson.title,
      content: lesson.content ?? "",
      type: lesson.type as "video" | "reading" | "quiz",
      duration: lesson.duration,
      savedAt: new Date().toISOString(),
    });

    setDownloading(null);

    if (success) {
      setOfflineLessons((prev) => new Set([...prev, lesson.id]));
      toast.success(`📥 "${lesson.title}" saved for offline reading!`);
    } else {
      toast.error("Storage full! Clear some offline lessons and try again.");
    }
  };

  // ── Download ALL ──────────────────────────────────────────────────────────────
  const handleDownloadAll = async () => {
    let saved = 0;
    for (const lesson of sortedLessons) {
      if (!offlineLessons.has(lesson.id)) {
        setDownloading(lesson.id);
        await new Promise((r) => setTimeout(r, 200));
        const success = saveOfflineLesson({
          lessonId: lesson.id,
          courseId: course.id,
          courseTitle: course.title,
          lessonTitle: lesson.title,
          content: lesson.content ?? "",
          type: lesson.type as "video" | "reading" | "quiz",
          duration: lesson.duration,
          savedAt: new Date().toISOString(),
        });
        if (success) saved++;
      }
    }
    setDownloading(null);
    setOfflineLessons(new Set(sortedLessons.map((l) => l.id)));
    toast.success(`📦 ${saved} lesson(s) saved for offline use!`);
  };

  const allDownloaded = sortedLessons.every((l) => offlineLessons.has(l.id));

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Offline Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-semibold text-white"
          >
            <WifiOff className="h-4 w-4" />
            You're offline — showing downloaded lessons only.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8">
        <Link
          to="/courses"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Courses
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ── Sidebar ──────────────────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border bg-card p-6 shadow-card sticky top-20">
              {/* Thumbnail or emoji */}
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-40 bg-emerald-50 rounded-lg mb-4 flex items-center justify-center">
                  <BookOpen className="h-14 w-14 text-emerald-300" />
                </div>
              )}

              <h1 className="font-display text-xl font-extrabold text-foreground">{course.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{course.description}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary">{course.subject}</Badge>
                <Badge variant="outline">Class {course.class_level}</Badge>
                <Badge variant="outline">{course.level}</Badge>
                {course.is_free && (
                  <Badge className="bg-success/10 text-success border-0">Free</Badge>
                )}
              </div>

              {/* Teacher info */}
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2.5">
                {course.teacher_photo_url ? (
                  <img
                    src={course.teacher_photo_url}
                    alt={course.teacher_name}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                    {(course.teacher_name ?? 'T')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Instructor</p>
                  <p className="text-sm font-semibold text-foreground">{course.teacher_name ?? 'Teacher'}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-display font-bold text-primary">{Math.round(completionPercent)}%</span>
                </div>
                <Progress value={completionPercent} className="mt-2 h-2" />
              </div>

              {/* Download All */}
              <div className="mt-4">
                {allDownloaded ? (
                  <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 text-sm font-semibold text-green-600">
                    <CheckCheck className="h-4 w-4" />
                    All lessons saved offline
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 font-display text-xs font-bold"
                    onClick={handleDownloadAll}
                    disabled={downloading !== null}
                  >
                    <Download className="h-4 w-4" />
                    {downloading ? "Saving…" : "Download Entire Course"}
                  </Button>
                )}
              </div>

              {/* Lesson List */}
              <div className="mt-6 space-y-2">
                {sortedLessons.map((lesson) => {
                  const Icon = lessonIcons[lesson.type] ?? FileText;
                  const isComplete = completedLessons.includes(lesson.id);
                  const isActive = activeLesson === lesson.id;
                  const isSaved = offlineLessons.has(lesson.id);
                  const isDownloadingThis = downloading === lesson.id;
                  const isDisabled = isOffline && !isSaved;

                  return (
                    <button
                      key={lesson.id}
                      disabled={isDisabled}
                      onClick={() => {
                        if (isDisabled) {
                          toast.error("This lesson isn't saved offline. Go online to access it.");
                          return;
                        }
                        setActiveLesson(lesson.id);
                        setQuizState(
                          lesson.type === "quiz"
                            ? { currentQ: 0, answers: [], submitted: false }
                            : null
                        );
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors ${
                        isActive ? "bg-primary/10 text-primary" :
                        isDisabled ? "cursor-not-allowed opacity-40" :
                        "hover:bg-muted"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                      ) : (
                        <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">{lesson.title}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Icon className="h-3 w-3" /> {lesson.duration || "—"}
                          {isSaved && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-green-500/10 px-1.5 py-0.5 text-[10px] font-bold text-green-600">
                              <Download className="h-2.5 w-2.5" /> Offline
                            </span>
                          )}
                          {isDownloadingThis && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                              Saving…
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Main Content ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {!activeL ? (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center rounded-xl border bg-card p-16 text-center shadow-card"
                >
                  <BookOpen className="mb-4 h-16 w-16 text-muted-foreground/30" />
                  <h2 className="font-display text-xl font-bold text-muted-foreground">
                    Select a lesson to begin
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Choose from the lesson list on the left.
                  </p>
                  {isOffline && offlineLessons.size === 0 && (
                    <div className="mt-6 rounded-xl border border-amber-400/30 bg-amber-500/10 px-6 py-4 text-sm text-amber-700">
                      <WifiOff className="mx-auto mb-2 h-6 w-6" />
                      You're offline and no lessons are downloaded yet.
                      <br />Connect to the internet to download lessons first.
                    </div>
                  )}
                </motion.div>

              ) : activeL.type === "quiz" && activeL.questions && activeL.questions.length > 0 ? (
                // ── Quiz View ─────────────────────────────────────────────────
                <motion.div
                  key={activeL.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl border bg-card p-8 shadow-card"
                >
                  <h2 className="font-display text-2xl font-bold text-foreground">{activeL.title}</h2>
                  <div className="mt-6 space-y-6">
                    {activeL.questions.map((q, qi) => (
                      <div key={qi} className="rounded-lg border bg-muted/30 p-5">
                        <p className="font-display font-bold text-foreground">{qi + 1}. {q.question}</p>
                        <div className="mt-3 space-y-2">
                          {q.options.map((opt, oi) => {
                            const selected = quizState?.answers[qi] === oi;
                            const isCorrect = quizState?.submitted && oi === q.correctAnswer;
                            const isWrong = quizState?.submitted && selected && oi !== q.correctAnswer;
                            return (
                              <button
                                key={oi}
                                disabled={quizState?.submitted}
                                onClick={() => {
                                  if (!quizState) return;
                                  const newAnswers = [...quizState.answers];
                                  newAnswers[qi] = oi;
                                  setQuizState({ ...quizState, answers: newAnswers });
                                }}
                                className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                                  isCorrect ? "border-success bg-success/10" :
                                  isWrong ? "border-destructive bg-destructive/10" :
                                  selected ? "border-primary bg-primary/10" :
                                  "hover:bg-muted"
                                }`}
                              >
                                <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${
                                  selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
                                }`}>
                                  {String.fromCharCode(65 + oi)}
                                </span>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  {!quizState?.submitted && (
                    <Button
                      className="mt-6 bg-gradient-primary font-display font-bold text-primary-foreground"
                      onClick={handleQuizSubmit}
                      disabled={!quizState || quizState.answers.length < (activeL.questions?.length ?? 0)}
                    >
                      Submit Quiz
                    </Button>
                  )}
                  {quizState?.submitted && (() => {
                    const quiz = activeL.questions ?? [];
                    const correct = quizState.answers.filter((a, i) => a === quiz[i]?.correctAnswer).length;
                    const pct = quiz.length > 0 ? Math.round((correct / quiz.length) * 100) : 0;
                    const isPerfect = correct === quiz.length;
                    const isPass = pct >= 60;
                    return (
                      <div className={`mt-6 rounded-xl border p-5 text-center ${
                        isPerfect ? "border-yellow-400/40 bg-yellow-400/10" :
                        isPass ? "border-success/40 bg-success/10" :
                        "border-destructive/30 bg-destructive/10"
                      }`}>
                        <div className="text-4xl mb-2">
                          {isPerfect ? "🏆" : isPass ? "✅" : "📝"}
                        </div>
                        <p className={`font-display text-2xl font-extrabold ${
                          isPerfect ? "text-yellow-600" : isPass ? "text-success" : "text-destructive"
                        }`}>{pct}%</p>
                        <p className="mt-1 font-display font-bold text-foreground">
                          {correct}/{quiz.length} correct
                        </p>
                        <p className={`mt-1 text-sm font-semibold ${
                          isPerfect ? "text-yellow-600" : isPass ? "text-success" : "text-muted-foreground"
                        }`}>
                          {isPerfect ? "Perfect score! 🎉" : isPass ? "Great job — passed!" : "Keep practicing!"}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">Score saved to your dashboard.</p>
                      </div>
                    );
                  })()}
                </motion.div>

              ) : (
                // ── Reading / Video Lesson View ────────────────────────────────
                <motion.div
                  key={activeL.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl border bg-card p-8 shadow-card"
                >
                  <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <h2 className="font-display text-2xl font-bold text-foreground">{activeL.title}</h2>
                      {offlineLessons.has(activeL.id) && (
                        <Badge variant="secondary" className="mt-2 gap-1 bg-green-500/10 text-green-600">
                          <Download className="h-3 w-3" /> Available Offline
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {/* TTS */}
                      {activeL.content && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => speakText(activeL.content ?? "")}
                          aria-label="Read aloud"
                          title="Read aloud"
                        >
                          <Volume2 className="h-5 w-5" />
                        </Button>
                      )}
                      {/* Download / Remove offline */}
                      <Button
                        variant={offlineLessons.has(activeL.id) ? "destructive" : "outline"}
                        size="sm"
                        className="gap-2 font-display text-xs font-bold"
                        onClick={() => handleDownload(activeL)}
                        disabled={downloading === activeL.id}
                        title={offlineLessons.has(activeL.id) ? "Remove from offline" : "Save for offline"}
                      >
                        {downloading === activeL.id ? (
                          <>Saving…</>
                        ) : offlineLessons.has(activeL.id) ? (
                          <><Trash2 className="h-4 w-4" /> Remove Offline</>
                        ) : (
                          <><Download className="h-4 w-4" /> Download</>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* ── Real Video Player ────────────────────────────────────── */}
                  {activeL.type === "video" && activeL.video_url && (
                    <div className="mb-6 rounded-xl overflow-hidden aspect-video bg-black shadow-lg">
                      <video
                        key={activeL.video_url}
                        controls
                        className="w-full h-full"
                        preload="metadata"
                        onEnded={() => markComplete(activeL.id)}
                      >
                        <source src={activeL.video_url} />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}

                  {/* Placeholder when no video URL yet */}
                  {activeL.type === "video" && !activeL.video_url && (
                    <div className="mb-6 flex aspect-video items-center justify-center rounded-lg bg-muted">
                      <div className="text-center">
                        <Video className="mx-auto mb-2 h-12 w-12 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">Video: {activeL.title}</p>
                        <p className="text-xs text-muted-foreground">(No video file uploaded yet)</p>
                      </div>
                    </div>
                  )}

                  {/* PDF Viewer */}
                  {activeL.pdf_url && (() => {
                    // Force download via Cloudinary fl_attachment flag
                    // Works for both /image/upload/ and /raw/upload/ URLs
                    const downloadUrl = activeL.pdf_url.replace('/upload/', '/upload/fl_attachment/');
                    // Google Docs viewer for inline embed — works with any public PDF URL
                    const embedUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(activeL.pdf_url)}&embedded=true`;
                    return (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <FileText className="h-4 w-4 text-primary" /> PDF Notes
                          </span>
                          <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition"
                          >
                            <Download className="h-3 w-3" /> Download PDF
                          </a>
                        </div>
                        <iframe
                          src={embedUrl}
                          className="w-full rounded-xl border shadow-sm bg-gray-50"
                          style={{ height: '560px' }}
                          title="PDF Viewer"
                          allow="fullscreen"
                        />
                      </div>
                    );
                  })()}

                  {/* Lesson Content / Notes */}
                  {activeL.content && (
                    <div className="prose prose-sm max-w-none">
                      {activeL.content.split("\n").map((line, i) => (
                        <p
                          key={i}
                          className={`text-foreground ${line.startsWith("-") ? "ml-4" : ""}`}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Mark Complete */}
                  {!completedLessons.includes(activeL.id) && (
                    <Button
                      className="mt-8 bg-gradient-primary font-display font-bold text-primary-foreground"
                      onClick={() => markComplete(activeL.id)}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Complete
                    </Button>
                  )}
                  {completedLessons.includes(activeL.id) && (
                    <div className="mt-8 flex items-center gap-2 text-success">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-display font-bold">Completed</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CourseDetail;
