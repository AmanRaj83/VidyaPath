import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { GraduationCap, BookOpen, Clock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { courses, classSubjectMap, subjectColors } from "@/data/courses";

// Subject icons for visual appeal
const subjectIcons: Record<string, string> = {
  Mathematics: "📐",
  Science: "🔬",
  English: "📗",
  Hindi: "📖",
  "Environmental Studies": "🌿",
  "Social Science": "🏛️",
  "Computer Science": "💻",
  Physics: "⚡",
  Chemistry: "⚗️",
  Biology: "🧬",
  Accountancy: "🧾",
  Economics: "📊",
};

// Class groups for display
const classGroups = [
  { label: "Primary", range: [1, 2, 3, 4, 5], color: "from-emerald-400 to-teal-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  { label: "Middle", range: [6, 7, 8], color: "from-blue-400 to-indigo-500", bg: "bg-blue-50", text: "text-blue-700" },
  { label: "Secondary", range: [9, 10], color: "from-violet-400 to-purple-500", bg: "bg-violet-50", text: "text-violet-700" },
  { label: "Senior Secondary", range: [11, 12], color: "from-orange-400 to-rose-500", bg: "bg-orange-50", text: "text-orange-700" },
];

const ClassSelector = () => {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const subjects = selectedClass ? classSubjectMap[selectedClass] || [] : [];

  const filteredCourses = courses.filter((c) => {
    if (!selectedClass) return false;
    const classMatch = c.classes?.includes(selectedClass);
    const subjectMatch = !selectedSubject || c.subject === selectedSubject;
    return classMatch && subjectMatch;
  });

  const handleClassSelect = (cls: number) => {
    if (selectedClass === cls) {
      setSelectedClass(null);
      setSelectedSubject(null);
    } else {
      setSelectedClass(cls);
      setSelectedSubject(null);
    }
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary mb-4">
            <GraduationCap className="h-4 w-4" /> Browse by Class
          </div>
          <h2 className="font-display text-3xl font-extrabold text-foreground md:text-4xl">
            Find Courses for Your Class
          </h2>
          <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
            Select your class (1–12) to see the exact subjects and courses designed for you
          </p>
        </div>

        {/* Class Groups */}
        {classGroups.map((group) => (
          <div key={group.label} className="mb-6">
            <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${group.text}`}>
              {group.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.range.map((cls) => {
                const isSelected = selectedClass === cls;
                const courseCount = courses.filter((c) => c.classes?.includes(cls)).length;
                return (
                  <button
                    key={cls}
                    onClick={() => handleClassSelect(cls)}
                    className={`relative flex items-center gap-2 rounded-xl px-5 py-3 font-display font-bold text-sm transition-all duration-200 ${
                      isSelected
                        ? `bg-gradient-to-r ${group.color} text-white shadow-lg scale-105`
                        : `${group.bg} ${group.text} border border-transparent hover:border-current hover:scale-102`
                    }`}
                  >
                    <span className="text-base">🎓</span>
                    Class {cls}
                    <span
                      className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        isSelected ? "bg-white/20 text-white" : "bg-white text-gray-500"
                      }`}
                    >
                      {courseCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Subjects & Courses for Selected Class */}
        <AnimatePresence mode="wait">
          {selectedClass && (
            <motion.div
              key={selectedClass}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-8"
            >
              {/* Class Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-border" />
                <span className="text-lg font-display font-extrabold text-foreground">
                  Class {selectedClass} — Subjects
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Subject Filter Chips */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <button
                  onClick={() => setSelectedSubject(null)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                    !selectedSubject
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-card border hover:bg-muted"
                  }`}
                >
                  All Subjects
                </button>
                {subjects.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubject(selectedSubject === sub ? null : sub)}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                      selectedSubject === sub
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-card border hover:bg-muted"
                    }`}
                  >
                    <span>{subjectIcons[sub] || "📚"}</span>
                    {sub}
                  </button>
                ))}
              </div>

              {/* Course Cards */}
              {filteredCourses.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                  {filteredCourses.map((course, i) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={`/courses/${course.id}`}
                        className="group flex flex-col rounded-2xl border bg-card p-5 shadow-card transition-all hover:shadow-elevated hover:-translate-y-1"
                      >
                        <div className="mb-3 text-4xl">{course.thumbnail}</div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${subjectColors[course.subject] || ""}`}
                          >
                            {course.subject}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {course.level}
                          </Badge>
                        </div>
                        <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2 flex-1">
                          {course.description}
                        </p>
                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3.5 w-3.5" /> {course.lessons.length} lessons
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> {course.totalDuration}
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary" />
                        </div>
                        {course.isFree && (
                          <div className="mt-3 inline-flex items-center rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success w-fit">
                            100% Free
                          </div>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">
                  No courses available for this filter. More coming soon! 🚀
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ClassSelector;
