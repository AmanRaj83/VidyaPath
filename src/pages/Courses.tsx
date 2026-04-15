import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, BookOpen, Search, Filter, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { fetchAllCourses, type CourseWithLessons } from "@/services/courseService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { subjectColors } from "@/data/courses";

const Courses = () => {
  const [courses, setCourses] = useState<CourseWithLessons[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAllCourses();
      setCourses(data);
    } catch (e) {
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const subjects = ["All", ...new Set(courses.map((c) => c.subject))];

  const filtered = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
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
          <p className="mt-2 text-muted-foreground">
            Quality education for everyone — no cost, no barriers.
          </p>
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
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
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

        {/* Loading */}
        {loading && (
          <div className="mt-16 flex justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-16 flex flex-col items-center gap-4 text-center text-muted-foreground">
            <p>{error}</p>
            <button
              onClick={load}
              className="flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Course Grid */}
        {!loading && !error && (
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
                  className="group block rounded-xl border bg-card shadow-card transition-all hover:shadow-elevated overflow-hidden"
                >
                  {/* Thumbnail */}
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-44 bg-emerald-50 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-emerald-300" />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="secondary"
                        className={subjectColors[course.subject] ?? ""}
                      >
                        {course.subject}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {course.level}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Class {course.class_level}
                      </Badge>
                    </div>
                    <h3 className="mt-3 font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        {course.lessons?.length ?? 0} lessons
                      </span>
                    </div>
                    {course.is_free && (
                      <div className="mt-3 inline-flex items-center rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">
                        100% Free
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && courses.length > 0 && (
          <div className="mt-16 text-center">
            <p className="text-xl text-muted-foreground">
              No courses match your search. Try a different filter.
            </p>
          </div>
        )}

        {!loading && !error && courses.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-xl text-muted-foreground">
              No courses published yet. Check back soon!
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Courses;
