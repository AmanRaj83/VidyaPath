import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Video, FileText, HelpCircle, CheckCircle2, Circle, Download, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { courses, quizData, getStoredProgress, saveProgress, addXP, updateStreak, getStoredBadges, saveBadges } from "@/data/courses";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const lessonIcons = { video: Video, reading: FileText, quiz: HelpCircle };

const CourseDetail = () => {
  const { courseId } = useParams();
  const course = courses.find((c) => c.id === courseId);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [quizState, setQuizState] = useState<{ currentQ: number; answers: number[]; submitted: boolean } | null>(null);

  useEffect(() => {
    if (!course) return;
    const progress = getStoredProgress();
    const courseProgress = progress.find((p) => p.courseId === course.id);
    if (courseProgress) setCompletedLessons(courseProgress.completedLessons);
  }, [course]);

  if (!course) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Course not found</h1>
          <Link to="/courses" className="mt-4 inline-block text-primary hover:underline">Back to courses</Link>
        </div>
      </div>
    );
  }

  const completionPercent = (completedLessons.length / course.lessons.length) * 100;
  const activeL = course.lessons.find((l) => l.id === activeLesson);

  const markComplete = (lessonId: string) => {
    if (completedLessons.includes(lessonId)) return;
    const updated = [...completedLessons, lessonId];
    setCompletedLessons(updated);

    const progress = getStoredProgress();
    const idx = progress.findIndex((p) => p.courseId === course.id);
    const entry = { courseId: course.id, completedLessons: updated, quizScores: [], lastAccessed: new Date().toISOString() };
    if (idx >= 0) progress[idx] = { ...progress[idx], ...entry };
    else progress.push(entry);
    saveProgress(progress);

    addXP(10);
    updateStreak();
    toast.success("Lesson completed! +10 XP 🎉");

    // Check badges
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

  const speakText = (text: string) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link to="/courses" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Courses
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sidebar - Lesson List */}
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

              <div className="mt-6 space-y-2">
                {course.lessons.map((lesson) => {
                  const Icon = lessonIcons[lesson.type];
                  const isComplete = completedLessons.includes(lesson.id);
                  const isActive = activeLesson === lesson.id;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        setActiveLesson(lesson.id);
                        setQuizState(lesson.type === "quiz" ? { currentQ: 0, answers: [], submitted: false } : null);
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors ${
                        isActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                      ) : (
                        <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{lesson.title}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Icon className="h-3 w-3" /> {lesson.duration}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
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
                </motion.div>
              ) : activeL.type === "quiz" && quizData[activeL.id] ? (
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
                <motion.div
                  key={activeL.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl border bg-card p-8 shadow-card"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-display text-2xl font-bold text-foreground">{activeL.title}</h2>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => speakText(activeL.content)} aria-label="Read aloud">
                        <Volume2 className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Download for offline">
                        <Download className="h-5 w-5" />
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
