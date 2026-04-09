import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GraduationCap, BookOpen, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { courses } from "@/data/courses";

// Class-to-subject mapping for Indian school system
const classSubjects: Record<string, string[]> = {
  "1-5": ["Mathematics", "English", "Hindi"],
  "6-8": ["Mathematics", "Science", "English", "Hindi", "Computer Science"],
  "9-10": ["Mathematics", "Science", "English", "Hindi", "Computer Science"],
  "11-12 Science": ["Mathematics", "Science", "Computer Science", "English"],
  "11-12 Commerce": ["Mathematics", "English", "Computer Science"],
  "11-12 Arts": ["English", "Hindi"],
};

const classGroups = [
  { label: "Class 1–5", value: "1-5", emoji: "🌱" },
  { label: "Class 6–8", value: "6-8", emoji: "📚" },
  { label: "Class 9–10", value: "9-10", emoji: "🎯" },
  { label: "Class 11–12 (Science)", value: "11-12 Science", emoji: "🔬" },
  { label: "Class 11–12 (Commerce)", value: "11-12 Commerce", emoji: "📊" },
  { label: "Class 11–12 (Arts)", value: "11-12 Arts", emoji: "🎨" },
];

const ClassSelector = () => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const subjects = selectedClass ? classSubjects[selectedClass] || [] : [];
  const filteredCourses = courses.filter((c) => subjects.includes(c.subject));

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary mb-4">
            <GraduationCap className="h-4 w-4" /> Select Your Class
          </div>
          <h2 className="font-display text-3xl font-extrabold text-foreground md:text-4xl">
            Find courses for your class
          </h2>
          <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
            Choose your class to see subjects and courses tailored for you
          </p>
        </div>

        {/* Class pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {classGroups.map((cg) => (
            <button
              key={cg.value}
              onClick={() => setSelectedClass(selectedClass === cg.value ? null : cg.value)}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 font-display text-sm font-bold transition-all ${
                selectedClass === cg.value
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : "bg-card border text-foreground hover:bg-primary/5 hover:border-primary/30"
              }`}
            >
              <span className="text-lg">{cg.emoji}</span>
              {cg.label}
            </button>
          ))}
        </div>

        {/* Subjects & Courses */}
        {selectedClass && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            {/* Subject badges */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {subjects.map((sub) => (
                <Badge key={sub} variant="secondary" className="px-4 py-1.5 text-sm">
                  {sub}
                </Badge>
              ))}
            </div>

            {/* Course cards */}
            {filteredCourses.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                {filteredCourses.map((course, i) => (
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
                      <div className="mb-3 text-4xl">{course.thumbnail}</div>
                      <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" /> {course.lessons.length} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {course.totalDuration}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                No courses available yet for this class. More coming soon! 🚀
              </p>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ClassSelector;
