import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Flame, Star, Trophy, BookOpen, Target, ArrowRight, Medal } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getStoredProgress, getStoredBadges, getXP, getStreak } from "@/data/courses";
import { fetchAllCourses, type CourseWithLessons } from "@/services/courseService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { UserProgress, Badge } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { classSubjects, getOnboardingProfile } from "@/data/onboarding";

const Dashboard = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [xp, setXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [courses, setCourses] = useState<CourseWithLessons[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    setProgress(getStoredProgress());
    setBadges(getStoredBadges());
    setXP(getXP());
    setStreak(getStreak());
  }, []);

  useEffect(() => {
    fetchAllCourses()
      .then(setCourses)
      .catch(() => {})
      .finally(() => setLoadingCourses(false));
  }, []);

  const totalLessons = courses.reduce((acc, c) => acc + (c.lessons?.length ?? 0), 0);
  const completedLessons = progress.reduce((acc, p) => acc + p.completedLessons.length, 0);
  const overallPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const level = Math.floor(xp / 100) + 1;
  const xpToNext = 100 - (xp % 100);
  const earnedBadges = badges.filter((b) => b.earned);

  const onboarding = user ? getOnboardingProfile(user.uid) : null;
  const recommendedSubjects = onboarding ? classSubjects[onboarding.classGroup] ?? [] : [];
  const recommendedCourses =
    recommendedSubjects.length > 0
      ? courses.filter((c) => recommendedSubjects.includes(c.subject)).slice(0, 3)
      : courses.slice(0, 3);

  // Build flat list of all saved quiz scores enriched with course/lesson names
  const allQuizScores = progress.flatMap((p) => {
    const course = courses.find((c) => c.id === p.courseId);
    return (p.quizScores ?? []).map((qs) => {
      const lesson = course?.lessons?.find((l) => l.id === qs.lessonId);
      const pct = qs.total > 0 ? Math.round((qs.score / qs.total) * 100) : 0;
      return {
        courseTitle: course?.title ?? "Unknown Course",
        lessonTitle: lesson?.title ?? "Quiz",
        score: qs.score,
        total: qs.total,
        pct,
      };
    });
  });

  const statCards = [
    { icon: Star, label: "Total XP", value: xp.toString(), color: "text-primary" },
    { icon: Flame, label: "Day Streak", value: streak.toString(), color: "text-destructive" },
    { icon: Target, label: "Level", value: level.toString(), color: "text-secondary" },
    { icon: BookOpen, label: "Lessons Done", value: `${completedLessons}/${totalLessons}`, color: "text-success" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-extrabold text-foreground md:text-4xl">
            {user?.displayName ? `Welcome, ${user.displayName}` : "Your Dashboard"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {onboarding
              ? `Class ${onboarding.classGroup} • Goal: ${onboarding.goal.replace(/-/g, " ")}`
              : "Track your learning journey and achievements."}
          </p>
        </motion.div>

        {onboarding && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-6 rounded-xl border bg-card p-5 shadow-card"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Your study path</h2>
                <p className="text-sm text-muted-foreground">
                  We selected courses based on your class and goal.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm font-semibold">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                  Class {onboarding.classGroup}
                </span>
                <span className="rounded-full bg-secondary/10 px-3 py-1 text-secondary">
                  {onboarding.goal.replace(/-/g, " ")}
                </span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {recommendedSubjects.map((subject) => (
                <span key={subject} className="rounded-full bg-muted px-3 py-1 text-sm text-foreground">
                  {subject}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border bg-card p-5 shadow-card"
            >
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
              <div className="mt-3 font-display text-2xl font-extrabold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* XP Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 rounded-xl border bg-card p-6 shadow-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">Level {level}</h3>
              <p className="text-sm text-muted-foreground">{xpToNext} XP to next level</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary font-display text-xl font-extrabold text-primary-foreground">
              {level}
            </div>
          </div>
          <Progress value={((xp % 100) / 100) * 100} className="mt-4 h-3" />
        </motion.div>

        {/* Course Progress / Recommended */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <h2 className="font-display text-xl font-bold text-foreground">
            {onboarding ? "Recommended for you" : "All Courses"}
          </h2>

          {loadingCourses ? (
            <div className="mt-6 flex justify-center">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {(onboarding ? recommendedCourses : courses.slice(0, 5)).map((course) => {
                const cp = progress.find((p) => p.courseId === course.id);
                const done = cp ? cp.completedLessons.length : 0;
                const total = course.lessons?.length ?? 1;
                const pct = (done / total) * 100;
                return (
                  <Link
                    key={course.id}
                    to={`/courses/${course.id}`}
                    className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-card transition-all hover:shadow-elevated overflow-hidden"
                  >
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                        <BookOpen className="h-7 w-7 text-emerald-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-bold text-foreground truncate">{course.title}</h3>
                        <span className="text-sm font-bold text-primary ml-2 shrink-0">{Math.round(pct)}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {course.subject} · Class {course.class_level}
                      </p>
                      <Progress value={pct} className="mt-2 h-2" />
                      <p className="mt-1 text-xs text-muted-foreground">{done}/{total} lessons</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </Link>
                );
              })}

              {courses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No courses available yet. Check back soon!</p>
                </div>
              )}
            </div>
          )}

          {courses.length > 0 && (
            <div className="mt-4 text-center">
              <Link to="/courses" className="inline-flex items-center gap-2 font-display font-bold text-primary hover:underline text-sm">
                Browse all {courses.length} courses <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <h2 className="font-display text-xl font-bold text-foreground">
            Badges ({earnedBadges.length}/{badges.length})
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-5">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`rounded-xl border p-4 text-center transition-all ${
                  badge.earned ? "bg-card shadow-card" : "bg-muted/50 opacity-50"
                }`}
              >
                <div className="text-3xl">{badge.icon}</div>
                <h4 className="mt-2 font-display text-sm font-bold text-foreground">{badge.name}</h4>
                <p className="mt-1 text-xs text-muted-foreground">{badge.description}</p>
                {badge.earned && (
                  <div className="mt-2 flex items-center justify-center gap-1 text-xs text-success">
                    <Trophy className="h-3 w-3" /> Earned!
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Quiz Results ──────────────────────────────────────────── */}
        {allQuizScores.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Medal className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-bold text-foreground">
                Quiz Results
              </h2>
              <span className="ml-auto text-sm text-muted-foreground">
                {allQuizScores.length} attempt{allQuizScores.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allQuizScores.map((qs, i) => {
                const isPerfect = qs.score === qs.total;
                const isPass = qs.pct >= 60;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.05 }}
                    className="rounded-xl border bg-card p-5 shadow-card flex items-center gap-4"
                  >
                    {/* Score ring */}
                    <div className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 font-display text-lg font-extrabold ${
                      isPerfect
                        ? "border-yellow-400 text-yellow-600 bg-yellow-400/10"
                        : isPass
                        ? "border-success text-success bg-success/10"
                        : "border-destructive text-destructive bg-destructive/10"
                    }`}>
                      {qs.pct}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">{qs.courseTitle}</p>
                      <h3 className="font-display font-bold text-foreground text-sm truncate mt-0.5">{qs.lessonTitle}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                          isPerfect
                            ? "bg-yellow-400/15 text-yellow-600"
                            : isPass
                            ? "bg-success/15 text-success"
                            : "bg-destructive/15 text-destructive"
                        }`}>
                          {isPerfect ? "🏆 Perfect" : isPass ? "✅ Passed" : "📝 Try again"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {qs.score}/{qs.total} correct
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {completedLessons === 0 && !loadingCourses && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-12 text-center"
          >
            <p className="text-lg text-muted-foreground">Start learning to see your progress here!</p>
            <Link to="/courses" className="mt-4 inline-flex items-center gap-2 font-display font-bold text-primary hover:underline">
              Browse Courses <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
