import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, BookOpen, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { courses } from "@/data/courses";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const subjectColors: Record<string, string> = {
  Mathematics: "bg-primary/10 text-primary",
  Science: "bg-secondary/10 text-secondary",
  English: "bg-accent/20 text-accent-foreground",
  Hindi: "bg-destructive/10 text-destructive",
  "Computer Science": "bg-success/10 text-success",
};

const Courses = () => {
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");

  const subjects = ["All", ...new Set(courses.map((c) => c.subject))];

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = selectedSubject === "All" || c.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-extrabold text-foreground md:text-4xl">
            Free Courses
          </h1>
          <p className="mt-2 text-muted-foreground">Quality education for everyone — no cost, no barriers.</p>
        </motion.div>

        {/* Search & Filter */}
        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 font-display text-xs font-bold transition-colors ${
                  selectedSubject === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Course Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/courses/${course.id}`}
                className="group block rounded-xl border bg-card p-6 shadow-card transition-all hover:shadow-elevated"
              >
                <div className="mb-4 text-5xl">{course.thumbnail}</div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={subjectColors[course.subject] || ""}>
                    {course.subject}
                  </Badge>
                  <Badge variant="outline" className="text-xs">{course.level}</Badge>
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" /> {course.lessons.length} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {course.totalDuration}
                  </span>
                </div>
                {course.isFree && (
                  <div className="mt-3 inline-flex items-center rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">
                    100% Free
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-xl text-muted-foreground">No courses found. Try a different search.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Courses;
