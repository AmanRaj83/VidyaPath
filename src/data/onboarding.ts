import type { OnboardingProfile } from "@/types";

export const classGroups = [
  { label: "Class 1–5", value: "1-5", emoji: "🌱" },
  { label: "Class 6–8", value: "6-8", emoji: "📚" },
  { label: "Class 9–10", value: "9-10", emoji: "🎯" },
  { label: "Class 11–12 (Science)", value: "11-12 Science", emoji: "🔬" },
  { label: "Class 11–12 (Commerce)", value: "11-12 Commerce", emoji: "📊" },
  { label: "Class 11–12 (Arts)", value: "11-12 Arts", emoji: "🎨" },
] as const;

export const goalOptions = [
  { label: "Learn fundamentals", value: "learn-fundamentals" },
  { label: "Improve exam scores", value: "improve-exams" },
  { label: "Practice quizzes", value: "practice-quizzes" },
  { label: "Build a daily study habit", value: "daily-habit" },
] as const;

export const classSubjects: Record<string, string[]> = {
  "1-5": ["Mathematics", "English", "Hindi"],
  "6-8": ["Mathematics", "Science", "English", "Hindi", "Computer Science"],
  "9-10": ["Mathematics", "Science", "English", "Hindi", "Computer Science"],
  "11-12 Science": ["Mathematics", "Science", "Computer Science", "English"],
  "11-12 Commerce": ["Mathematics", "English", "Computer Science"],
  "11-12 Arts": ["English", "Hindi"],
};

const storageKey = (userId: string) => `vidyapath-onboarding-${userId}`;

export const getOnboardingProfile = (userId: string): OnboardingProfile | null => {
  const stored = localStorage.getItem(storageKey(userId));
  return stored ? (JSON.parse(stored) as OnboardingProfile) : null;
};

export const hasCompletedOnboarding = (userId: string) => Boolean(getOnboardingProfile(userId));

export const saveOnboardingProfile = (userId: string, profile: Omit<OnboardingProfile, "completedAt">) => {
  const payload: OnboardingProfile = {
    ...profile,
    completedAt: new Date().toISOString(),
  };
  localStorage.setItem(storageKey(userId), JSON.stringify(payload));
  return payload;
};
