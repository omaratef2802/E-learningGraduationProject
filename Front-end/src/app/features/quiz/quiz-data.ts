import { ICertificateData, IQuiz } from './models';

export const SECTION_1_QUIZ: IQuiz = {
  id: 'quiz-s1',
  sectionId: 's1',
  courseTitle: 'Complete React Development',
  sectionTitle: 'React Fundamentals — Section 1 Exam',
  assessmentBadge: 'Section 1 Assessment',
  passingScore: 60,
  isFinalCapstone: false,
  questions: [
    {
      id: 1,
      question: 'What is the main purpose of React?',
      options: [
        'Building user interfaces',
        'Managing databases',
        'Creating server infrastructure',
        'Managing operating systems',
      ],
      correctAnswer: 0,
    },
    {
      id: 2,
      question: 'What is JSX in React?',
      options: [
        'A database query language for React',
        'A syntax extension for JavaScript that looks like HTML',
        'A CSS preprocessor designed specifically for components',
        'A server-side routing protocol',
      ],
      correctAnswer: 1,
    },
    {
      id: 3,
      question: 'How do you pass data from a parent component to a child component?',
      options: [
        'Using local storage',
        'Using CSS variables',
        'Using props (properties)',
        'Using browser cookies',
      ],
      correctAnswer: 2,
    },
    {
      id: 4,
      question: 'What is the Virtual DOM in React?',
      options: [
        'A virtual reality interface for web development',
        'An in-memory lightweight representation of the actual DOM',
        'A direct copy of the MongoDB database',
        'A browser extension for debugging styles',
      ],
      correctAnswer: 1,
    },
    {
      id: 5,
      question: 'Which Hook is used to add state variables to functional components?',
      options: ['useEffect', 'useReducer', 'useState', 'useContext'],
      correctAnswer: 2,
    },
    {
      id: 6,
      question: 'Why should list items in React have a unique "key" prop?',
      options: [
        'To help React identify which items have changed, been added, or removed',
        'To style list items automatically with CSS',
        'To encrypt the list items for cybersecurity',
        'Keys are optional and provide no performance benefit',
      ],
      correctAnswer: 0,
    },
    {
      id: 7,
      question: 'What happens when a component’s state changes in React?',
      options: [
        'The entire webpage reloads completely from the server',
        'The component and its children re-render to reflect the new state',
        'The database is automatically deleted',
        'The browser shuts down the tab',
      ],
      correctAnswer: 1,
    },
    {
      id: 8,
      question: 'Can props be modified directly by the child component that receives them?',
      options: [
        'Yes, props are mutable in child components',
        'No, props are read-only and immutable for the child component',
        'Only if the props are strings or numbers',
        'Only inside class components',
      ],
      correctAnswer: 1,
    },
    {
      id: 9,
      question: 'Which tool is commonly used for bundling and tooling modern React applications?',
      options: ['Vite / Webpack', 'MySQL Workbench', 'Photoshop', 'Postman'],
      correctAnswer: 0,
    },
    {
      id: 10,
      question: 'What is a Pure Function in the context of React Components?',
      options: [
        'A function that always returns the same output for the same input and has no side effects',
        'A function that connects directly to third-party payment gateways',
        'A function without any return statement',
        'A function that only accepts string arguments',
      ],
      correctAnswer: 0,
    },
  ],
};

export const SECTION_2_QUIZ: IQuiz = {
  id: 'quiz-s2',
  sectionId: 's2',
  courseTitle: 'Complete React Development',
  sectionTitle: 'Working with Data — Section 2 Exam',
  assessmentBadge: 'Section 2 Assessment',
  passingScore: 60,
  isFinalCapstone: false,
  questions: [
    {
      id: 1,
      question: 'What is the primary use case of the useEffect Hook?',
      options: [
        'Performing side effects such as data fetching, subscriptions, or DOM mutations',
        'Creating 3D graphic models in the browser canvas',
        'Managing relational database schemas',
        'Compiling TypeScript code into binary',
      ],
      correctAnswer: 0,
    },
    {
      id: 2,
      question: 'What does the dependency array in useEffect control?',
      options: [
        'When the effect function should re-run based on changed dependencies',
        'How many CPU cores to allocate to the hook',
        'The styling variables applied to the parent component',
        'The network port used for HTTP requests',
      ],
      correctAnswer: 0,
    },
    {
      id: 3,
      question: 'What is the purpose of returning a cleanup function from useEffect?',
      options: [
        'To clean up subscriptions, timers, or abort fetch requests when component unmounts',
        'To clear the browser history automatically',
        'To delete unused local storage items',
        'To refresh the CSS stylesheet',
      ],
      correctAnswer: 0,
    },
    {
      id: 4,
      question: 'What is TanStack Query (React Query) primarily used for?',
      options: [
        'Server-state management, caching, background refetching, and synchronization',
        'Creating relational tables in PostgreSQL',
        'Writing unit tests for CSS flexbox',
        'Video rendering in web workers',
      ],
      correctAnswer: 0,
    },
    {
      id: 5,
      question: 'How do you handle loading and error states when fetching data in React?',
      options: [
        'Using state variables (e.g. isLoading, error) and conditional rendering',
        'Restarting the browser whenever an error occurs',
        'Hiding the screen with a black overlay permanently',
        'React handles errors without any code needed',
      ],
      correctAnswer: 0,
    },
    {
      id: 6,
      question: 'What is a Custom Hook in React?',
      options: [
        'A JavaScript function whose name starts with "use" and that can call other Hooks',
        'A custom HTML tag created in the DOM',
        'A private API owned by React core team',
        'A special hardware driver for mouse and keyboard',
      ],
      correctAnswer: 0,
    },
    {
      id: 7,
      question: 'Which method is standard for aborting HTTP fetch requests in a cleanup function?',
      options: ['AbortController', 'System.exit()', 'window.stopAll()', 'fetch.cancel()'],
      correctAnswer: 0,
    },
    {
      id: 8,
      question: 'What is optimistic UI updating?',
      options: [
        'Updating the UI immediately assuming the server request will succeed, and rolling back if it fails',
        'Writing only positive comments in code',
        'Hiding errors from users permanently',
        'Speeding up internet bandwidth',
      ],
      correctAnswer: 0,
    },
    {
      id: 9,
      question: 'Where should sensitive API keys never be stored in a frontend React app?',
      options: [
        'In client-side source code or public environment variables',
        'On a secure backend server',
        'In secret manager vaults',
        'Behind an authenticated API proxy',
      ],
      correctAnswer: 0,
    },
    {
      id: 10,
      question: 'What is debouncing in the context of user input search fields?',
      options: [
        'Delaying API execution until the user stops typing for a specified interval',
        'Removing vowels from search queries',
        'Encrypting search text twice',
        'Playing a bouncing animation on inputs',
      ],
      correctAnswer: 0,
    },
  ],
};

export const SECTION_3_QUIZ: IQuiz = {
  id: 'quiz-s3',
  sectionId: 's3',
  courseTitle: 'Complete React Development',
  sectionTitle: 'React Fundamentals & Architecture — Capstone Exam',
  assessmentBadge: 'Capstone Certification Exam',
  passingScore: 60,
  isFinalCapstone: true, // This one unlocks the Graduation Certificate!
  questions: [
    {
      id: 1,
      question: 'What is the main benefit of Zustand compared to traditional Redux?',
      options: [
        'Minimal boilerplate, simple hooks-based store, and no context providers required',
        'It works only on mobile phones',
        'It replaces HTML completely',
        'It prevents React from re-rendering forever',
      ],
      correctAnswer: 0,
    },
    {
      id: 2,
      question: 'In React Router, what component is used to render nested child route components?',
      options: ['<Outlet />', '<RouterChild />', '<NextPage />', '<NestedView />'],
      correctAnswer: 0,
    },
    {
      id: 3,
      question: 'How do selectors in Zustand prevent unnecessary component re-renders?',
      options: [
        'Components only re-render when the specific selected slice of state changes',
        'By disabling all component updates globally',
        'By freezing browser memory',
        'Selectors do not affect re-rendering',
      ],
      correctAnswer: 0,
    },
    {
      id: 4,
      question: 'What is code splitting and lazy loading in React applications?',
      options: [
        'Loading component bundles on demand (via React.lazy / dynamic import) to reduce initial bundle size',
        'Splitting code into two different computer screens',
        'Writing code in two different programming languages simultaneously',
        'Deleting old code during build time',
      ],
      correctAnswer: 0,
    },
    {
      id: 5,
      question: 'What does React.memo do for functional components?',
      options: [
        'Memoizes the rendered output and skips re-rendering if props have not changed',
        'Records audio memos inside components',
        'Stores state in browser cookies',
        'Forces components to re-render every second',
      ],
      correctAnswer: 0,
    },
    {
      id: 6,
      question: 'What is the purpose of useCallback in React optimization?',
      options: [
        'Returns a memoized version of a callback function that only changes if dependencies change',
        'Calls the backend API automatically every minute',
        'Calls user phone number on error',
        'Replaces useState hook',
      ],
      correctAnswer: 0,
    },
    {
      id: 7,
      question: 'What is an Error Boundary in React?',
      options: [
        'A component that catches JavaScript errors in its child component tree and displays fallback UI',
        'A firewall installed in the operating system',
        'A CSS property to border errors in red',
        'A TypeScript compile-time lint rule',
      ],
      correctAnswer: 0,
    },
    {
      id: 8,
      question: 'Which pattern is recommended for scalable React state management?',
      options: [
        'Keep state local where possible, lift state up when shared, use global store for app-wide state',
        'Put every variable in one single global store',
        'Store all state in window.globalState',
        'Avoid state altogether',
      ],
      correctAnswer: 0,
    },
    {
      id: 9,
      question: 'How do protected routes typically prevent unauthenticated access in React Router?',
      options: [
        'By checking authentication state and redirecting to login if user is not authenticated',
        'By password-protecting the computer screen',
        'By disabling JavaScript in browser',
        'By deleting the router config',
      ],
      correctAnswer: 0,
    },
    {
      id: 10,
      question: 'What criteria determines successful graduation in the PathwayEd Capstone assessment?',
      options: [
        'Scoring 80% or higher on the comprehensive Capstone evaluation',
        'Watching only 1 minute of video',
        'Posting on social media',
        'Paying extra examination fees',
      ],
      correctAnswer: 0,
    },
  ],
};

export const ALL_QUIZZES: Record<string, IQuiz> = {
  s1: SECTION_1_QUIZ,
  s2: SECTION_2_QUIZ,
  s3: SECTION_3_QUIZ,
};

export const MOCK_CERTIFICATE: ICertificateData = {
  certificateId: 'CERT-2024-00124',
  studentName: 'Naema Chen',
  courseTitle: 'Complete React Development',
  trackName: 'Full-Stack Web Development Track',
  issueDate: 'Issued Oct 2024',
  score: 92,
  passingScore: 60,
  grade: 'Distinction',
  isVerified: true,
};
