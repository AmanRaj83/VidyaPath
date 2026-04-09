import { motion } from "framer-motion";
import { ArrowRight, Wifi, Eye, Gamepad2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-illustration.jpg";

const features = [
  {
    icon: Wifi,
    title: "Offline-First",
    description: "Download lessons and learn anywhere — no internet needed.",
  },
  {
    icon: Eye,
    title: "Fully Accessible",
    description: "Text-to-speech, high contrast, and WCAG 2.1 compliant design.",
  },
  {
    icon: Gamepad2,
    title: "Gamified Learning",
    description: "Quizzes, rewards, and streaks to keep you motivated.",
  },
];

const stats = [
  { value: "500M+", label: "Potential Reach" },
  { value: "26M", label: "Differently-Abled Learners" },
  { value: "₹0", label: "Entry Cost" },
  { value: "3-Tier", label: "Cities Reached" },
];

const HeroSection = () => (
  <section className="bg-gradient-hero">
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="font-display text-xs font-bold text-primary">FREE FOR ALL</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold leading-tight text-foreground md:text-5xl lg:text-6xl">
            Inclusive EdTech for{" "}
            <span className="text-gradient-primary">Every Indian</span>
          </h1>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">
            VidyaPath bridges India's digital education divide — designed for underserved communities, built for accessibility, powered by purpose.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/courses">
              <Button className="bg-gradient-primary font-display font-bold text-primary-foreground shadow-elevated hover:opacity-90">
                Start Learning <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="font-display font-bold">
                View Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <img
            src={heroImage}
            alt="Diverse Indian students learning together on digital devices"
            className="w-full rounded-2xl shadow-elevated"
            width={1920}
            height={1024}
          />
        </motion.div>
      </div>
    </div>

    {/* Features */}
    <div className="container mx-auto px-4 pb-16">
      <div className="grid gap-6 md:grid-cols-3">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
            className="rounded-xl border bg-card p-6 shadow-card transition-shadow hover:shadow-elevated"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <feature.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">{feature.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>

    {/* Impact Stats */}
    <div className="bg-gradient-primary py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-10 text-center font-display text-3xl font-extrabold text-primary-foreground">
          Expected Impact
        </h2>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-3xl font-extrabold text-primary-foreground md:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm font-medium text-primary-foreground/80">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;
