/**
 * Curriculum content templates used by seed/curriculum.js.
 *
 * Every course gets the same 3-section roadmap shape, with titles, questions
 * and lesson copy personalised using the course title so the generated data
 * reads as related to the course instead of pure lorem ipsum.
 */

// Stable, publicly available YouTube embeds used as placeholder lesson videos.
const VIDEO_POOL = [
  "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "https://www.youtube.com/embed/jNQXAC9IVRw",
  "https://www.youtube.com/embed/9bZkp7q19f0",
  "https://www.youtube.com/embed/kJQP7kiw5Fk",
  "https://www.youtube.com/embed/ScMzIvxBSi4",
];

const pickVideo = (seed) => VIDEO_POOL[seed % VIDEO_POOL.length];

// ------------------------------------------------------------------ sections
const SECTION_BLUEPRINTS = [
  {
    suffix: "Introduction & Foundations",
    description: (course) =>
      `Start ${course} from zero: understand what the course covers, the vocabulary you will use, and set up everything you need before the practical work begins.`,
    lessons: [
      { title: "Course Overview & Learning Roadmap", type: "video", duration: 12 },
      { title: "Key Concepts & Terminology", type: "text", duration: 15 },
      { title: "Environment Setup & Tools", type: "video", duration: 18 },
      { title: "Guided First Steps", type: "text", duration: 20 },
    ],
  },
  {
    suffix: "Core Concepts & Hands-On Practice",
    description: (course) =>
      `Study the core concepts of ${course} and apply them through step-by-step exercises, common patterns, and reviewed solutions.`,
    lessons: [
      { title: "Deep Dive into Core Techniques", type: "video", duration: 25 },
      { title: "Step-by-Step Implementation", type: "text", duration: 22 },
      { title: "Common Patterns & Best Practices", type: "video", duration: 20 },
      { title: "Exercise & Solution Walkthrough", type: "text", duration: 18 },
    ],
  },
  {
    suffix: "Advanced Topics & Capstone",
    description: (course) =>
      `Finish ${course} with advanced techniques, a real-world capstone exercise, and a final assessment that proves what you can do.`,
    lessons: [
      { title: "Advanced Techniques & Optimization", type: "video", duration: 24 },
      { title: "Real-World Capstone Project", type: "text", duration: 30 },
      { title: "Wrap-Up, Next Steps & Resources", type: "text", duration: 12 },
    ],
  },
];

// --------------------------------------------------------------- lesson copy
const lessonText = (course, lessonTitle) =>
  `In this lesson you work through "${lessonTitle}" as part of the "${course}" course. ` +
  `We introduce the idea first, then apply it in a small guided example so you can see how it behaves in practice. ` +
  `Pay attention to the steps shown, repeat them on your own, and jot down anything that feels unclear — ` +
  `the lesson quiz at the end checks exactly these points before you move on to the next lesson.`;

// ------------------------------------------------------------------- quizzes
/** 3-question quiz attached to a single lesson. */
const lessonQuizQuestions = (course, lessonTitle) => [
  {
    question: `What is the main focus of the "${lessonTitle}" lesson?`,
    options: [
      `Understanding and applying the key ideas of ${lessonTitle}`,
      "Memorizing definitions without any practice",
      "Skipping the practical exercises",
      "Installing tools only",
    ],
    correctAnswer: `Understanding and applying the key ideas of ${lessonTitle}`,
    points: 1,
  },
  {
    question: `Which approach works best when studying "${course}"?`,
    options: [
      "Practicing with small examples and reviewing the results",
      "Reading once and moving on",
      "Avoiding questions and quizzes",
      "Copying code without understanding it",
    ],
    correctAnswer: "Practicing with small examples and reviewing the results",
    points: 1,
  },
  {
    question: "What should you do when a concept in this lesson feels unclear?",
    options: [
      "Revisit the lesson material and try a hands-on example",
      "Ignore it and continue to the next section",
      "Leave the course entirely",
      "Memorize the text without applying it",
    ],
    correctAnswer: "Revisit the lesson material and try a hands-on example",
    points: 1,
  },
];

/** 5-question final assessment for a whole section. */
const sectionQuizQuestions = (course) => [
  {
    question: `Which statement best describes the "${course}" course?`,
    options: [
      "It builds practical skills through structured lessons, practice, and assessment",
      "It only covers theory with no practice",
      "It focuses on memorizing terminology",
      "It requires no follow-along work",
    ],
    correctAnswer:
      "It builds practical skills through structured lessons, practice, and assessment",
    points: 1,
  },
  {
    question: "What is the best way to measure your progress in this course?",
    options: [
      "Passing the lesson quizzes and completing the section final quiz",
      "Skipping quizzes to save time",
      "Only reading the titles of the lessons",
      "Watching videos without any practice",
    ],
    correctAnswer:
      "Passing the lesson quizzes and completing the section final quiz",
    points: 1,
  },
  {
    question: "How should you approach problem solving in this section?",
    options: [
      "Break the problem into small steps and validate each step",
      "Write everything at once and hope it works",
      "Avoid testing your work",
      "Copy-paste solutions blindly",
    ],
    correctAnswer: "Break the problem into small steps and validate each step",
    points: 1,
  },
  {
    question: "You just finished this section — what comes next?",
    options: [
      "Review your quiz results, fix weak points, then continue to the next section",
      "Restart the course from the beginning",
      "Stop learning entirely",
      "Skip all remaining sections",
    ],
    correctAnswer:
      "Review your quiz results, fix weak points, then continue to the next section",
    points: 1,
  },
  {
    question: "Why do practical exercises matter in this course?",
    options: [
      "They reinforce the concepts and reveal gaps in understanding",
      "They are optional decorations",
      "They replace the need for fundamentals",
      "They only slow learning down",
    ],
    correctAnswer:
      "They reinforce the concepts and reveal gaps in understanding",
    points: 1,
  },
];

module.exports = {
  VIDEO_POOL,
  pickVideo,
  SECTION_BLUEPRINTS,
  lessonText,
  lessonQuizQuestions,
  sectionQuizQuestions,
};