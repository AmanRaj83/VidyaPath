import { BookOpen, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t bg-card">
    <div className="container mx-auto px-4 py-10">
      <div className="grid gap-8 md:grid-cols-3">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-extrabold text-foreground">
              Vidya<span className="text-gradient-primary">Path</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Inclusive EdTech for Every Indian. Bridging the digital education divide.
          </p>
        </div>
        <div>
          <h4 className="font-display font-bold text-foreground">Quick Links</h4>
          <div className="mt-3 flex flex-col gap-2">
            <Link to="/courses" className="text-sm text-muted-foreground hover:text-primary">Courses</Link>
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary">Dashboard</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-bold text-foreground">Accessibility</h4>
          <p className="mt-3 text-sm text-muted-foreground">
            Built with WCAG 2.1 guidelines. Text-to-speech, high contrast, and offline support included.
          </p>
        </div>
      </div>
      <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
        <p className="flex items-center justify-center gap-1">
          Made with <Heart className="h-4 w-4 text-primary" /> for every learner in India
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
