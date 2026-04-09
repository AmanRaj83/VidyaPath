import type { Course, Badge, UserProgress } from "@/types";

export const courses: Course[] = [
  {
    id: "math-basics",
    title: "Mathematics Foundations",
    description: "Master basic mathematics concepts from numbers to algebra. Designed for Class 6-8 students.",
    subject: "Mathematics",
    level: "Beginner",
    totalDuration: "12 hours",
    thumbnail: "📐",
    isFree: true,
    lessons: [
      { id: "m1", title: "Introduction to Numbers", duration: "15 min", type: "video", content: "Learn about natural numbers, whole numbers, and integers. Understanding the number line and basic operations.", isCompleted: false },
      { id: "m2", title: "Fractions & Decimals", duration: "20 min", type: "reading", content: "A fraction represents a part of a whole. For example, 1/2 means one part out of two equal parts. Decimals are another way to represent fractions — 0.5 is the same as 1/2.\n\nKey concepts:\n- Proper fractions: numerator < denominator (e.g., 3/4)\n- Improper fractions: numerator ≥ denominator (e.g., 7/4)\n- Mixed numbers: whole number + fraction (e.g., 1¾)\n\nTo convert a fraction to decimal, divide the numerator by the denominator.", isCompleted: false },
      { id: "m3", title: "Quiz: Numbers & Fractions", duration: "10 min", type: "quiz", content: "quiz", isCompleted: false },
      { id: "m4", title: "Introduction to Algebra", duration: "25 min", type: "video", content: "Understanding variables, expressions, and simple equations.", isCompleted: false },
      { id: "m5", title: "Solving Linear Equations", duration: "20 min", type: "reading", content: "A linear equation is an equation where the highest power of the variable is 1.\n\nExample: 2x + 3 = 7\nStep 1: Subtract 3 from both sides → 2x = 4\nStep 2: Divide both sides by 2 → x = 2\n\nAlways check your answer by substituting back into the original equation.", isCompleted: false },
    ],
  },
  {
    id: "science-world",
    title: "Science Around Us",
    description: "Explore the wonders of science through everyday examples. Physics, Chemistry, and Biology basics.",
    subject: "Science",
    level: "Beginner",
    totalDuration: "15 hours",
    thumbnail: "🔬",
    isFree: true,
    lessons: [
      { id: "s1", title: "What is Science?", duration: "15 min", type: "video", content: "Science is the systematic study of the natural world through observation and experiments.", isCompleted: false },
      { id: "s2", title: "States of Matter", duration: "20 min", type: "reading", content: "Matter exists in three main states: solid, liquid, and gas.\n\n- Solids have fixed shape and volume\n- Liquids have fixed volume but take the shape of their container\n- Gases have neither fixed shape nor fixed volume\n\nChanging temperature can convert matter from one state to another.", isCompleted: false },
      { id: "s3", title: "Quiz: Matter Basics", duration: "10 min", type: "quiz", content: "quiz", isCompleted: false },
      { id: "s4", title: "Forces & Motion", duration: "25 min", type: "video", content: "Understanding push, pull, and Newton's laws of motion.", isCompleted: false },
    ],
  },
  {
    id: "english-comm",
    title: "English Communication",
    description: "Build strong English reading, writing, and speaking skills for everyday use.",
    subject: "English",
    level: "Beginner",
    totalDuration: "10 hours",
    thumbnail: "📝",
    isFree: true,
    lessons: [
      { id: "e1", title: "Parts of Speech", duration: "20 min", type: "video", content: "Learn about nouns, verbs, adjectives, and adverbs.", isCompleted: false },
      { id: "e2", title: "Sentence Structure", duration: "15 min", type: "reading", content: "A sentence must have a subject and a predicate.\n\nSubject: Who or what the sentence is about\nPredicate: What the subject does\n\nExample: 'The cat (subject) sat on the mat (predicate).'\n\nTypes of sentences:\n- Declarative (statement)\n- Interrogative (question)\n- Imperative (command)\n- Exclamatory (strong emotion)", isCompleted: false },
      { id: "e3", title: "Quiz: Grammar Basics", duration: "10 min", type: "quiz", content: "quiz", isCompleted: false },
    ],
  },
  {
    id: "hindi-sahitya",
    title: "हिंदी भाषा और साहित्य",
    description: "हिंदी व्याकरण, लेखन और साहित्य की बुनियादी समझ। कक्षा 6-10 के छात्रों के लिए।",
    subject: "Hindi",
    level: "Beginner",
    totalDuration: "8 hours",
    thumbnail: "📖",
    isFree: true,
    lessons: [
      { id: "h1", title: "संज्ञा और सर्वनाम", duration: "15 min", type: "video", content: "संज्ञा किसी व्यक्ति, वस्तु, स्थान या भाव के नाम को कहते हैं।", isCompleted: false },
      { id: "h2", title: "विलोम शब्द", duration: "15 min", type: "reading", content: "विलोम शब्द वे शब्द होते हैं जिनके अर्थ एक-दूसरे के विपरीत होते हैं।\n\nउदाहरण:\n- अच्छा ↔ बुरा\n- दिन ↔ रात\n- सुख ↔ दुःख", isCompleted: false },
      { id: "h3", title: "प्रश्नोत्तरी: व्याकरण", duration: "10 min", type: "quiz", content: "quiz", isCompleted: false },
    ],
  },
  {
    id: "digital-literacy",
    title: "Digital Literacy",
    description: "Learn to use computers, smartphones, and the internet safely and effectively.",
    subject: "Computer Science",
    level: "Beginner",
    totalDuration: "6 hours",
    thumbnail: "💻",
    isFree: true,
    lessons: [
      { id: "d1", title: "What is a Computer?", duration: "15 min", type: "video", content: "A computer is an electronic device that processes data according to instructions.", isCompleted: false },
      { id: "d2", title: "Using the Internet Safely", duration: "20 min", type: "reading", content: "The internet is a powerful tool, but it's important to stay safe.\n\nSafety tips:\n- Never share personal information with strangers\n- Use strong passwords\n- Don't click on suspicious links\n- Ask a trusted adult if something feels wrong", isCompleted: false },
      { id: "d3", title: "Quiz: Digital Basics", duration: "10 min", type: "quiz", content: "quiz", isCompleted: false },
    ],
  },
];

export const quizData: Record<string, { question: string; options: string[]; correctAnswer: number }[]> = {
  m3: [
    { question: "What is 3/4 as a decimal?", options: ["0.34", "0.75", "0.43", "1.33"], correctAnswer: 1 },
    { question: "Which is an improper fraction?", options: ["1/2", "3/4", "7/4", "2/5"], correctAnswer: 2 },
    { question: "What is 15 + (-8)?", options: ["23", "7", "-7", "8"], correctAnswer: 1 },
  ],
  s3: [
    { question: "Which state of matter has a fixed shape?", options: ["Liquid", "Gas", "Solid", "Plasma"], correctAnswer: 2 },
    { question: "What happens when ice melts?", options: ["Solid to gas", "Liquid to solid", "Solid to liquid", "Gas to liquid"], correctAnswer: 2 },
    { question: "Which has no fixed volume?", options: ["Solid", "Liquid", "Gas", "Ice"], correctAnswer: 2 },
  ],
  e3: [
    { question: "Which is a noun?", options: ["Run", "Beautiful", "Cat", "Quickly"], correctAnswer: 2 },
    { question: "Which sentence is interrogative?", options: ["Close the door.", "What a day!", "Is it raining?", "It is raining."], correctAnswer: 2 },
    { question: "What is the verb in 'She reads books'?", options: ["She", "reads", "books", "None"], correctAnswer: 1 },
  ],
  h3: [
    { question: "'दिन' का विलोम शब्द क्या है?", options: ["सुबह", "रात", "दोपहर", "शाम"], correctAnswer: 1 },
    { question: "संज्ञा किसे कहते हैं?", options: ["क्रिया के नाम को", "किसी वस्तु के नाम को", "विशेषण को", "सर्वनाम को"], correctAnswer: 1 },
    { question: "'सुख' का विलोम शब्द क्या है?", options: ["आनंद", "दुःख", "खुशी", "प्रसन्नता"], correctAnswer: 1 },
  ],
  d3: [
    { question: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Power Unit", "Central Program Unit"], correctAnswer: 0 },
    { question: "Which is a strong password?", options: ["123456", "password", "MyD0g!sC00l#2", "abcdef"], correctAnswer: 2 },
    { question: "What should you do if you get a suspicious email?", options: ["Click all links", "Share with friends", "Delete and report it", "Reply immediately"], correctAnswer: 2 },
  ],
};

export const badges: Badge[] = [
  { id: "first-lesson", name: "First Step", description: "Complete your first lesson", icon: "🌱", earned: false },
  { id: "quiz-master", name: "Quiz Master", description: "Score 100% on any quiz", icon: "🏆", earned: false },
  { id: "streak-3", name: "3-Day Streak", description: "Learn for 3 consecutive days", icon: "🔥", earned: false },
  { id: "course-complete", name: "Course Champion", description: "Complete an entire course", icon: "🎓", earned: false },
  { id: "multi-subject", name: "Explorer", description: "Start courses in 3 different subjects", icon: "🧭", earned: false },
];

export const getStoredProgress = (): UserProgress[] => {
  const stored = localStorage.getItem("vidyapath-progress");
  return stored ? JSON.parse(stored) : [];
};

export const saveProgress = (progress: UserProgress[]) => {
  localStorage.setItem("vidyapath-progress", JSON.stringify(progress));
};

export const getStoredBadges = (): Badge[] => {
  const stored = localStorage.getItem("vidyapath-badges");
  return stored ? JSON.parse(stored) : badges;
};

export const saveBadges = (b: Badge[]) => {
  localStorage.setItem("vidyapath-badges", JSON.stringify(b));
};

export const getStreak = (): number => {
  const stored = localStorage.getItem("vidyapath-streak");
  return stored ? JSON.parse(stored) : 0;
};

export const getXP = (): number => {
  const stored = localStorage.getItem("vidyapath-xp");
  return stored ? JSON.parse(stored) : 0;
};

export const addXP = (amount: number) => {
  const current = getXP();
  localStorage.setItem("vidyapath-xp", JSON.stringify(current + amount));
};

export const updateStreak = () => {
  const lastDate = localStorage.getItem("vidyapath-last-active");
  const today = new Date().toDateString();
  if (lastDate === today) return;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (lastDate === yesterday.toDateString()) {
    const streak = getStreak() + 1;
    localStorage.setItem("vidyapath-streak", JSON.stringify(streak));
  } else if (lastDate !== today) {
    localStorage.setItem("vidyapath-streak", JSON.stringify(1));
  }
  localStorage.setItem("vidyapath-last-active", today);
};
