import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/integrations/firebase/client";
import { hasCompletedOnboarding } from "@/data/onboarding";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      toast({ title: "Welcome!", description: "Logged in with Google." });
      navigate(hasCompletedOnboarding(result.user.uid) ? "/" : "/onboarding");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Google login failed";
      toast({ title: "Login failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary">
            <BookOpen className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-foreground">
            Vidya<span className="text-gradient-primary">Path</span>
          </h1>
          <p className="mt-2 text-muted-foreground">Free quality education for every student</p>
        </div>

        <div className="rounded-2xl border bg-card p-8 shadow-card">
          <h2 className="mb-1 font-display text-xl font-bold text-foreground">Continue with Google</h2>
          <p className="mb-6 text-sm text-muted-foreground">Sign in quickly using your Google account</p>

          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-primary font-display font-bold"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Continue with Google
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing, you agree to VidyaPath's Terms of Service
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
