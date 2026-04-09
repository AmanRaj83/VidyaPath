export interface Course {
  id: string;
  title: string;
  description: string;
  subject: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  lessons: Lesson[];
  totalDuration: string;
  thumbnail: string;
  isFree: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "reading" | "quiz";
  content: string;
  isCompleted: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface UserProgress {
  courseId: string;
  completedLessons: string[];
  quizScores: { lessonId: string; score: number; total: number }[];
  lastAccessed: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}
