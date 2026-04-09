import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, LayoutDashboard, Menu, X, Volume2, VolumeX, LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const links = [
    { to: "/", label: "Home", icon: BookOpen },
    { to: "/courses", label: "Courses", icon: BookOpen },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  const toggleTTS = () => {
    setTtsEnabled(!ttsEnabled);
    if (!ttsEnabled) {
      const utterance = new SpeechSynthesisUtterance("Text to speech enabled");
      utterance.lang = "en-IN";
      speechSynthesis.speak(utterance);
    } else {
      speechSynthesis.cancel();
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-extrabold text-foreground">
            Vidya<span className="text-gradient-primary">Path</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-lg px-4 py-2 font-display text-sm font-semibold transition-colors ${
                location.pathname === link.to
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTTS}
            className="rounded-full"
            aria-label={ttsEnabled ? "Disable text to speech" : "Enable text to speech"}
          >
            {ttsEnabled ? <Volume2 className="h-5 w-5 text-primary" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}
          </Button>
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => { await signOut(); navigate("/"); }}
              className="hidden gap-1.5 font-display text-sm md:inline-flex"
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/login")}
              className="hidden gap-1.5 rounded-xl bg-gradient-primary font-display text-sm md:inline-flex"
            >
              <LogIn className="h-4 w-4" /> Login
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t bg-card px-4 py-3 md:hidden">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-lg px-4 py-3 font-display text-sm font-semibold ${
                location.pathname === link.to
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={async () => { setMobileOpen(false); await signOut(); navigate("/"); }}
              className="block w-full rounded-lg px-4 py-3 text-left font-display text-sm font-semibold text-destructive"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-4 py-3 font-display text-sm font-semibold text-primary"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
