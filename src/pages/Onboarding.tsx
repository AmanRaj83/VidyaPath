import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, ArrowRight, Target, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveOnboardingProfile, classGroups, goalOptions, classSubjects } from "@/data/onboarding";
import { courses } from "@/data/courses";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Onboarding = () => {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const recommendedCourses = useMemo(() => {
    const subjects = classSubjects[selectedClass] ?? [];
    return courses.filter((course) => subjects.includes(course.subject)).slice(0, 3);
  }, [selectedClass]);

  const handleFinish = async () => {
    if (!user) return;
    if (!selectedClass || !selectedGoal) {
      toast({
        title: "Complete both steps",
        description: "Choose your class and goal to continue.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    saveOnboardingProfile(user.uid, {
      classGroup: selectedClass,
      goal: selectedGoal,
    });
    toast({ title: "Setup complete", description: "Your dashboard is ready." });
    navigate("/dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-hero px-4 py-10">
      <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />

      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid w-full gap-6 rounded-3xl border bg-card/95 p-6 shadow-elevated backdrop-blur-sm md:grid-cols-[1.1fr_0.9fr] md:p-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
              <GraduationCap className="h-4 w-4" /> Guided Setup
            </div>
            <h1 className="mt-4 font-display text-3xl font-extrabold text-foreground md:text-4xl">
              Let’s personalize your learning path
            </h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Pick your class and learning goal. We’ll use that to shape the dashboard and suggest the right lessons first.
            </p>

            <div className="mt-6 flex items-center gap-3 text-sm font-semibold text-muted-foreground">
              <span className={`rounded-full px-3 py-1 ${step === 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                1. Class
              </span>
              <span className="h-px flex-1 bg-border" />
              <span className={`rounded-full px-3 py-1 ${step === 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                2. Goal
              </span>
            </div>

            {step === 1 ? (
              <div className="mt-6 space-y-3">
                {classGroups.map((group) => (
                  <button
                    key={group.value}
                    onClick={() => setSelectedClass(group.value)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-all ${
                      selectedClass === group.value
                        ? "border-primary bg-primary/10 shadow-card"
                        : "bg-background/60 hover:border-primary/30 hover:bg-primary/5"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-2xl">{group.emoji}</span>
                      <span>
                        <span className="block font-display font-bold text-foreground">{group.label}</span>
                        <span className="text-sm text-muted-foreground">Tailored subjects and course suggestions</span>
                      </span>
                    </span>
                    {selectedClass === group.value ? <CheckCircle2 className="h-5 w-5 text-primary" /> : null}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {goalOptions.map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => setSelectedGoal(goal.value)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-all ${
                      selectedGoal === goal.value
                        ? "border-primary bg-primary/10 shadow-card"
                        : "bg-background/60 hover:border-primary/30 hover:bg-primary/5"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-primary">
                        <Target className="h-5 w-5" />
                      </span>
                      <span className="font-display font-bold text-foreground">{goal.label}</span>
                    </span>
                    {selectedGoal === goal.value ? <CheckCircle2 className="h-5 w-5 text-primary" /> : null}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              {step === 2 ? (
                <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl font-display font-bold">
                  Back
                </Button>
              ) : null}
              <Button
                onClick={() => (step === 1 ? setStep(2) : handleFinish())}
                disabled={saving || (step === 1 ? !selectedClass : !selectedGoal)}
                className="rounded-xl bg-gradient-primary font-display font-bold"
              >
                {saving ? "Saving..." : step === 1 ? "Continue" : "Finish setup"}
                {step === 1 ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border bg-background/60 p-5 shadow-card">
            <h2 className="font-display text-xl font-bold text-foreground">Your preview</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              After setup, you’ll land on a dashboard that reflects your class and goal.
            </p>

            <div className="mt-5 rounded-2xl bg-muted p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <BookOpen className="h-4 w-4" /> Suggested subjects
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(classSubjects[selectedClass] ?? ["Mathematics", "Science", "English"]).map((subject) => (
                  <span key={subject} className="rounded-full bg-card px-3 py-1 text-sm font-semibold text-foreground shadow-sm">
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-dashed p-4">
              <p className="text-sm text-muted-foreground">Recommended courses will appear here based on your class.</p>
              <div className="mt-3 space-y-2">
                {recommendedCourses.map((course) => (
                  <div key={course.id} className="rounded-xl bg-muted/50 px-3 py-2 text-sm font-medium text-foreground">
                    {course.title}
                  </div>
                ))}
                {!selectedClass ? (
                  <p className="text-sm text-muted-foreground">Choose a class to preview courses.</p>
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Onboarding;
