import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, GraduationCap, Users, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/integrations/firebase/client";
import { hasCompletedOnboarding } from "@/data/onboarding";
import { saveUserRole, type UserRole } from "@/data/userRole";
import { useToast } from "@/hooks/use-toast";

const googleLogoSVG = (
  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

interface RoleCardProps {
  role: UserRole;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  accentColor: string;
  badgeColor: string;
  loading: boolean;
  onLogin: (role: UserRole) => void;
}

const RoleCard = ({
  role,
  title,
  subtitle,
  description,
  icon,
  gradient,
  accentColor,
  badgeColor,
  loading,
  onLogin,
}: RoleCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4, scale: 1.01 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className="group relative overflow-hidden rounded-2xl border bg-card shadow-lg transition-shadow hover:shadow-xl"
  >
    {/* Top accent bar */}
    <div className={`h-1.5 w-full ${gradient}`} />

    <div className="p-6">
      {/* Icon + badge */}
      <div className="mb-4 flex items-start justify-between">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${gradient} shadow-md`}
        >
          {icon}
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest ${badgeColor}`}
        >
          {role}
        </span>
      </div>

      {/* Text */}
      <h3 className="font-display text-xl font-bold text-foreground">{title}</h3>
      <p className={`mt-0.5 text-sm font-semibold ${accentColor}`}>{subtitle}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>

      {/* Button */}
      <Button
        id={`google-login-${role}`}
        onClick={() => onLogin(role)}
        disabled={loading}
        variant="outline"
        className={`mt-5 w-full gap-3 rounded-xl border-2 py-5 font-display font-bold transition-all duration-200 hover:${gradient} hover:border-transparent hover:text-white`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          googleLogoSVG
        )}
        <span>Sign in with Google</span>
        {!loading && <ChevronRight className="ml-auto h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />}
      </Button>
    </div>
  </motion.div>
);

const Login = () => {
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleLogin = async (role: UserRole) => {
    setLoadingRole(role);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const uid = result.user.uid;

      // Persist the chosen role
      saveUserRole(uid, role);

      toast({
        title: `Welcome${result.user.displayName ? `, ${result.user.displayName.split(" ")[0]}` : ""}! 🎉`,
        description: `Signed in as ${role === "teacher" ? "Teacher" : "Student"}.`,
      });

      if (role === "teacher") {
        navigate("/Teacherdashboard");
      } else {
        navigate(hasCompletedOnboarding(uid) ? "/" : "/onboarding");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Google login failed";
      toast({ title: "Login failed", description: message, variant: "destructive" });
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="mb-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4, type: "spring" }}
            className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-primary shadow-lg"
          >
            <BookOpen className="h-10 w-10 text-white" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground">
              Vidya<span className="text-gradient-primary">Path</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Free quality education for every student
            </p>
          </motion.div>

          {/* Divider with label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-8 flex items-center gap-3"
          >
            <div className="flex-1 border-t border-border" />
            <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Choose how you want to sign in
            </span>
            <div className="flex-1 border-t border-border" />
          </motion.div>
        </div>

        {/* Role cards */}
        <div className="grid gap-5 sm:grid-cols-2">
          <RoleCard
            role="student"
            title="I'm a Student"
            subtitle="Learn & Grow"
            description="Access free courses, quizzes, and study materials tailored to your class and goals."
            icon={<GraduationCap className="h-7 w-7 text-white" />}
            gradient="bg-gradient-to-br from-violet-500 to-indigo-600"
            accentColor="text-indigo-500"
            badgeColor="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
            loading={loadingRole === "student"}
            onLogin={handleGoogleLogin}
          />

          <RoleCard
            role="teacher"
            title="I'm a Teacher"
            subtitle="Teach & Inspire"
            description="Create courses, manage classes, track student progress, and share your knowledge."
            icon={<Users className="h-7 w-7 text-white" />}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            accentColor="text-emerald-600"
            badgeColor="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
            loading={loadingRole === "teacher"}
            onLogin={handleGoogleLogin}
          />
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-xs text-muted-foreground"
        >
          By continuing, you agree to VidyaPath's{" "}
          <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">
            Privacy Policy
          </span>
          .
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
