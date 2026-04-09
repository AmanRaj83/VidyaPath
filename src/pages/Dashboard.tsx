import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Flame, Star, Trophy, BookOpen, Target, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { courses, getStoredProgress, getStoredBadges, getXP, getStreak } from "@/data/courses";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { UserProgress, Badge } from "@/types";

const Dashboard = () => {
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [xp, setXP] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setProgress(getStoredProgress());
    setBadges(getStoredBadges());
    setXP(getXP());
    setStreak(getStreak());
  }, []);

  const totalLessons = courses.reduce((acc, c) => acc + c.lessons.length, 0);
  const completedLessons = progress.reduce((acc, p) => acc + p.completedLessons.length, 0);
  const overallPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const level = Math.floor(xp / 100) + 1;
  const xpToNext = 100 - (xp % 100);
  const earnedBadges = badges.filter((b) => b.earned);

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
            Your Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">Track your learning journey and achievements.</p>
        </motion.div>

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

        {/* Course Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <h2 className="font-display text-xl font-bold text-foreground">Course Progress</h2>
          <div className="mt-4 space-y-4">
            {courses.map((course) => {
              const cp = progress.find((p) => p.courseId === course.id);
              const done = cp ? cp.completedLessons.length : 0;
              const pct = (done / course.lessons.length) * 100;
              return (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-card transition-all hover:shadow-elevated"
                >
                  <span className="text-3xl">{course.thumbnail}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-foreground">{course.title}</h3>
                      <span className="text-sm font-bold text-primary">{Math.round(pct)}%</span>
                    </div>
                    <Progress value={pct} className="mt-2 h-2" />
                    <p className="mt-1 text-xs text-muted-foreground">{done}/{course.lessons.length} lessons</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
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

        {/* Empty state */}
        {completedLessons === 0 && (
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
