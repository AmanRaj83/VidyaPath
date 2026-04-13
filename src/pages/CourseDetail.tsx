import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, BookOpen, Video, FileText, HelpCircle,
  CheckCircle2, Circle, Download, Volume2, WifiOff,
  Trash2, CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  courses, quizData, getStoredProgress, saveProgress,
  addXP, updateStreak, getStoredBadges, saveBadges,
} from "@/data/courses";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useOffline } from "@/hooks/useOffline";
import {
  isLessonOffline, saveOfflineLesson, removeOfflineLesson,
  getOfflineLessonsForCourse,
} from "@/lib/offlineStorage";

const lessonIcons = { video: Video, reading: FileText, quiz: HelpCircle };

const CourseDetail = () => {
  const { courseId } = useParams();
  const course = courses.find((c) => c.id === courseId);
  const { isOnline, isOffline } = useOffline();

  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [quizState, setQuizState] = useState<{
    currentQ: number; answers: number[]; submitted: boolean;
  } | null>(null);
  // Track which lessons are saved offline (as a set for O(1) lookup)
  const [offlineLessons, setOfflineLessons] = useState<Set<string>>(new Set());
  // Track download-in-progress per lessonId
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (!course) return;
    // Load saved progress
    const progress = getStoredProgress();
    const courseProgress = progress.find((p) => p.courseId === course.id);
    if (courseProgress) setCompletedLessons(courseProgress.completedLessons);
    // Load offline index for this course
    const saved = getOfflineLessonsForCourse(course.id);
    setOfflineLessons(new Set(saved.map((l) => l.lessonId)));
  }, [course]);

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

  const completionPercent = (completedLessons.length / course.lessons.length) * 100;
  const activeL = course.lessons.find((l) => l.id === activeLesson);

  // ── Mark lesson complete ─────────────────────────────────────────────────
  const markComplete = (lessonId: string) => {
    if (completedLessons.includes(lessonId)) return;
    const updated = [...completedLessons, lessonId];
    setCompletedLessons(updated);

    const progress = getStoredProgress();
    const idx = progress.findIndex((p) => p.courseId === course.id);
    const entry = {
      courseId: course.id,
      completedLessons: updated,
      quizScores: [],
      lastAccessed: new Date().toISOString(),
    };
    if (idx >= 0) progress[idx] = { ...progress[idx], ...entry };
    else progress.push(entry);
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
    if (updated.length === course.lessons.length) {
      const courseBadge = badges.find((b) => b.id === "course-complete");
      if (courseBadge && !courseBadge.earned) {
        courseBadge.earned = true;
        courseBadge.earnedDate = new Date().toISOString();
        saveBadges(badges);
        toast("🎓 Badge earned: Course Champion!");
      }
    }
  };

  // ── Quiz submit ───────────────────────────────────────────────────────────
  const handleQuizSubmit = () => {
    if (!quizState || !activeLesson) return;
    const quiz = quizData[activeLesson];
    if (!quiz) return;
    let correct = 0;
    quizState.answers.forEach((a, i) => { if (a === quiz[i].correctAnswer) correct++; });
    setQuizState({ ...quizState, submitted: true });

    const score = Math.round((correct / quiz.length) * 100);
    addXP(correct * 5);
    toast.success(`Quiz score: ${correct}/${quiz.length} (${score}%) — +${correct * 5} XP`);

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

  // ── Text to speech ────────────────────────────────────────────────────────
  const speakText = (text: string) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    speechSynthesis.speak(utterance);
  };

  // ── Download / Remove offline lesson ─────────────────────────────────────
  const handleDownload = async (lesson: typeof course.lessons[0]) => {
    if (offlineLessons.has(lesson.id)) {
      // Already saved — ask to remove
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
    // Simulate a tiny delay so user sees feedback
    await new Promise((r) => setTimeout(r, 400));

    const success = saveOfflineLesson({
      lessonId: lesson.id,
      courseId: course.id,
      courseTitle: course.title,
      lessonTitle: lesson.title,
      content: lesson.content,
      type: lesson.type,
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

  // ── Download ALL lessons in one click ────────────────────────────────────
  const handleDownloadAll = async () => {
    let saved = 0;
    for (const lesson of course.lessons) {
      if (!offlineLessons.has(lesson.id)) {
        setDownloading(lesson.id);
        await new Promise((r) => setTimeout(r, 200));
        const success = saveOfflineLesson({
          lessonId: lesson.id,
          courseId: course.id,
          courseTitle: course.title,
          lessonTitle: lesson.title,
          content: lesson.content,
          type: lesson.type,
          duration: lesson.duration,
          savedAt: new Date().toISOString(),
        });
        if (success) saved++;
      }
    }
    setDownloading(null);
    const allIds = new Set(course.lessons.map((l) => l.id));
    setOfflineLessons(allIds);
    toast.success(`📦 ${saved} lesson(s) saved for offline use!`);
  };

  const allDownloaded = course.lessons.every((l) => offlineLessons.has(l.id));

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Offline Banner ────────────────────────────────────────────────── */}
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
        <Link to="/courses" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Courses
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <div className="mb-4 text-4xl">{course.thumbnail}</div>
              <h1 className="font-display text-xl font-extrabold text-foreground">{course.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{course.description}</p>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-display font-bold text-primary">{Math.round(completionPercent)}%</span>
                </div>
                <Progress value={completionPercent} className="mt-2 h-2" />
              </div>

              {/* Download All Button */}
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
                    {downloading ? "Saving..." : "Download Entire Course"}
                  </Button>
                )}
              </div>

              {/* Lesson List */}
              <div className="mt-6 space-y-2">
                {course.lessons.map((lesson) => {
                  const Icon = lessonIcons[lesson.type];
                  const isComplete = completedLessons.includes(lesson.id);
                  const isActive = activeLesson === lesson.id;
                  const isSaved = offlineLessons.has(lesson.id);
                  const isDownloading = downloading === lesson.id;

                  // If offline and lesson not saved → disable
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
                          <Icon className="h-3 w-3" /> {lesson.duration}
                          {isSaved && (
                            <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-green-500/10 px-1.5 py-0.5 text-[10px] font-bold text-green-600">
                              <Download className="h-2.5 w-2.5" /> Offline
                            </span>
                          )}
                          {isDownloading && (
                            <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                              Saving...
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

          {/* ── Main Content ─────────────────────────────────────────────── */}
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
                  <h2 className="font-display text-xl font-bold text-muted-foreground">Select a lesson to begin</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Choose from the lesson list on the left.</p>
                  {isOffline && offlineLessons.size === 0 && (
                    <div className="mt-6 rounded-xl border border-amber-400/30 bg-amber-500/10 px-6 py-4 text-sm text-amber-700">
                      <WifiOff className="mx-auto mb-2 h-6 w-6" />
                      You're offline and no lessons are downloaded yet.
                      <br />Connect to the internet to download lessons first.
                    </div>
                  )}
                </motion.div>
              ) : activeL.type === "quiz" && quizData[activeL.id] ? (
                // ── Quiz View ───────────────────────────────────────────
                <motion.div
                  key={activeL.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl border bg-card p-8 shadow-card"
                >
                  <h2 className="font-display text-2xl font-bold text-foreground">{activeL.title}</h2>
                  <div className="mt-6 space-y-6">
                    {quizData[activeL.id].map((q, qi) => (
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
                      disabled={!quizState || quizState.answers.length < quizData[activeL.id].length}
                    >
                      Submit Quiz
                    </Button>
                  )}
                  {quizState?.submitted && (
                    <div className="mt-6 rounded-lg bg-success/10 p-4 text-center">
                      <p className="font-display font-bold text-success">Quiz completed! Review your answers above.</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                // ── Reading / Video Lesson View ──────────────────────────
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
                      {/* TTS button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => speakText(activeL.content)}
                        aria-label="Read aloud"
                        title="Read aloud"
                      >
                        <Volume2 className="h-5 w-5" />
                      </Button>
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
                          <>Saving...</>
                        ) : offlineLessons.has(activeL.id) ? (
                          <><Trash2 className="h-4 w-4" /> Remove Offline</>
                        ) : (
                          <><Download className="h-4 w-4" /> Download</>
                        )}
                      </Button>
                    </div>
                  </div>

                  {activeL.type === "video" && (
                    <div className="mb-6 flex aspect-video items-center justify-center rounded-lg bg-muted">
                      <div className="text-center">
                        <Video className="mx-auto mb-2 h-12 w-12 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">Video: {activeL.title}</p>
                        <p className="text-xs text-muted-foreground">(Demo placeholder — video would play here)</p>
                      </div>
                    </div>
                  )}

                  <div className="prose prose-sm max-w-none">
                    {activeL.content.split("\n").map((line, i) => (
                      <p key={i} className={`text-foreground ${line.startsWith("-") ? "ml-4" : ""}`}>{line}</p>
                    ))}
                  </div>

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
