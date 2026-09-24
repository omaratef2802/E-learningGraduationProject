import { ICertificateData, IQuiz } from './models';

export const SECTION_1_QUIZ: IQuiz = {
  id: 's1',
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
  id: 's2',
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
  id: 's3',
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

export const LESSON_1_QUIZ: IQuiz = {
  id: 'quiz_l1',
  sectionId: 's1',
  lessonId: 'l1',
  courseTitle: 'Complete React Development',
  sectionTitle: 'Lesson 1 Quiz: Intro to React & Tooling Setup',
  assessmentBadge: 'Lesson 1 Micro-Quiz',
  passingScore: 60,
  isFinalCapstone: false,
  questions: [
    {
      id: 1,
      question: 'Which modern command is commonly used to scaffold a fast React application?',
      options: ['npm create vite@latest', 'npm install react-database', 'git clone internet', 'python start-react'],
      correctAnswer: 0,
    },
    {
      id: 2,
      question: 'What is the role of Node.js in modern React development?',
      options: [
        'It serves as the runtime environment for build tooling and dependency management',
        'It is required by the browser to display JSX',
        'It renders CSS styles in GPU',
        'It replaces the HTML standard in browsers',
      ],
      correctAnswer: 0,
    },
    {
      id: 3,
      question: 'Where is the single HTML container div located that React mounts into?',
      options: ['In index.html', 'Inside package.json', 'Inside node_modules', 'In the CSS file'],
      correctAnswer: 0,
    },
  ],
};

export const LESSON_2_QUIZ: IQuiz = {
  id: 'quiz_l2',
  sectionId: 's1',
  lessonId: 'l2',
  courseTitle: 'Complete React Development',
  sectionTitle: 'Lesson 2 Quiz: JSX, Virtual DOM & Components',
  assessmentBadge: 'Lesson 2 Micro-Quiz',
  passingScore: 60,
  isFinalCapstone: false,
  questions: [
    {
      id: 1,
      question: 'What does JSX stand for in React?',
      options: ['JavaScript XML', 'Java Syntax Extension', 'JSON Xylophone', 'JavaScript Xerox'],
      correctAnswer: 0,
    },
    {
      id: 2,
      question: 'How does React optimize DOM updates using the Virtual DOM?',
      options: [
        'By computing differences in memory (diffing) and batching DOM updates efficiently',
        'By skipping rendering completely',
        'By converting HTML into C++ code',
        'By refreshing the whole web page on every change',
      ],
      correctAnswer: 0,
    },
    {
      id: 3,
      question: 'Can a React component return multiple adjacent JSX tags without a parent or Fragment?',
      options: [
        'No, JSX elements must be wrapped in an enclosing tag or Fragment (<>...</>)',
        'Yes, any number of root tags can be returned without wrapper',
        'Only if they are <div> elements',
        'Only in development mode',
      ],
      correctAnswer: 0,
    },
  ],
};

export const LESSON_3_QUIZ: IQuiz = {
  id: 'quiz_l3',
  sectionId: 's1',
  lessonId: 'l3',
  courseTitle: 'Complete React Development',
  sectionTitle: 'Lesson 3 Quiz: Props & Component Data Architecture',
  assessmentBadge: 'Lesson 3 Micro-Quiz',
  passingScore: 60,
  isFinalCapstone: false,
  questions: [
    {
      id: 1,
      question: 'How does data primarily flow between parent and child components in React?',
      options: [
        'One-way downward flow via props (unidirectional data flow)',
        'Two-way automatic sync between any components',
        'Through global cookies',
        'Upward from child to parent automatically',
      ],
      correctAnswer: 0,
    },
    {
      id: 2,
      question: 'Are props mutable or read-only inside the component receiving them?',
      options: [
        'Props are read-only and immutable for the receiving component',
        'Props can be directly modified like local variables',
        'Props are only mutable if they are arrays',
        'Props change automatically without re-rendering',
      ],
      correctAnswer: 0,
    },
    {
      id: 3,
      question: 'What is the term for passing props down through multiple layers of components that don’t need them?',
      options: ['Prop drilling', 'Component hoisting', 'Virtual stacking', 'State bubbling'],
      correctAnswer: 0,
    },
  ],
};

export const LESSON_4_QUIZ: IQuiz = {
  id: 'quiz_l4',
  sectionId: 's2',
  lessonId: 'l4',
  courseTitle: 'Complete React Development',
  sectionTitle: 'Lesson 4 Quiz: API Gateways & HTTP Protocols',
  assessmentBadge: 'Lesson 4 Micro-Quiz',
  passingScore: 60,
  isFinalCapstone: false,
  questions: [
    {
      id: 1,
      question: 'Which HTTP method is conventionally used to read or fetch resources from a REST API?',
      options: ['GET', 'POST', 'DELETE', 'PATCH'],
      correctAnswer: 0,
    },
    {
      id: 2,
      question: 'What does the HTTP 200 status code indicate?',
      options: ['The request has succeeded', 'Resource was not found', 'Internal server crash', 'Unauthorized request'],
      correctAnswer: 0,
    },
    {
      id: 3,
      question: 'What is CORS in web browser security?',
      options: [
        'Cross-Origin Resource Sharing security mechanism enforced by browsers',
        'A CSS framework for responsive layout',
        'A React compiler plugin',
        'A database management tool',
      ],
      correctAnswer: 0,
    },
  ],
};

export const LESSON_5_QUIZ: IQuiz = {
  id: 'quiz_l5',
  sectionId: 's2',
  lessonId: 'l5',
  courseTitle: 'Complete React Development',
  sectionTitle: 'Lesson 5 Quiz: Fetching Data with useEffect & TanStack',
  assessmentBadge: 'Lesson 5 Micro-Quiz',
  passingScore: 60,
  isFinalCapstone: false,
  questions: [
    {
      id: 1,
      question: 'When will a `useEffect` hook execute if passed an empty dependency array `[]`?',
      options: [
        'Only once after the component mounts',
        'On every state update continuously',
        'Never',
        'Only right before the browser closes',
      ],
      correctAnswer: 0,
    },
    {
      id: 2,
      question: 'What primary problem does TanStack Query solve in React applications?',
      options: [
        'Server state management, automated caching, deduplication, and background updates',
        'Compiling TypeScript to JavaScript',
        'Creating 3D WebGL graphics',
        'Formatting CSS files',
      ],
      correctAnswer: 0,
    },
    {
      id: 3,
      question: 'Why is it important to provide cleanup functions in `useEffect` when setting up subscriptions?',
      options: [
        'To prevent memory leaks and dangling listeners when components unmount',
        'To force the computer CPU to slow down',
        'Cleanup functions are required by HTML',
        'To encrypt network traffic',
      ],
      correctAnswer: 0,
    },
  ],
};

export const LESSON_6_QUIZ: IQuiz = {
  id: 'quiz_l6',
  sectionId: 's2',
  lessonId: 'l6',
  courseTitle: 'Complete React Development',
  sectionTitle: 'Lesson 6 Quiz: Custom Hooks & Production APIs',
  assessmentBadge: 'Lesson 6 Micro-Quiz',
  passingScore: 60,
  isFinalCapstone: false,
  questions: [
    {
      id: 1,
      question: 'What convention must the name of a custom React Hook follow?',
      options: ['Must start with lowercase "use" (e.g. useUserData)', 'Must end with "Hook"', 'Must be in UPPERCASE', 'Must contain the word "React"'],
      correctAnswer: 0,
    },
    {
      id: 2,
      question: 'What is the primary motivation for writing custom Hooks in React?',
      options: [
        'To encapsulate and reuse stateful logic across multiple components cleanly',
        'To connect directly to SQL without an API',
        'To replace CSS stylesheets',
        'To speed up internet bandwidth',
      ],
      correctAnswer: 0,
    },
    {
      id: 3,
      question: 'Can a custom Hook call built-in React hooks like useState and useEffect?',
      options: [
        'Yes, custom hooks can freely compose built-in React hooks',
        'No, custom hooks cannot use any built-in hooks',
        'Only inside class components',
        'Only in server components',
      ],
      correctAnswer: 0,
    },
  ],
};

export const LESSON_7_QUIZ: IQuiz = {
  id: 'quiz_l7',
  sectionId: 's3',
  lessonId: 'l7',
  courseTitle: 'Complete React Development',
  sectionTitle: 'Lesson 7 Quiz: Zustand Store Setup & Selectors',
  assessmentBadge: 'Lesson 7 Micro-Quiz',
  passingScore: 60,
  isFinalCapstone: false,
  questions: [
    {
      id: 1,
      question: 'What is Zustand in modern frontend development?',
      options: [
        'A small, fast, and scalable bearbones state-management solution for React',
        'A database engine written in Python',
        'A CSS animation framework',
        'A replacement for the browser DOM',
      ],
      correctAnswer: 0,
    },
    {
      id: 2,
      question: 'Why are selectors (e.g. `useStore(state => state.user)`) recommended in Zustand?',
      options: [
        'They prevent unnecessary re-renders by selecting only the specific slice needed',
        'They encrypt the data in memory',
        'They convert state into HTML automatically',
        'They are required for TypeScript compilation',
      ],
      correctAnswer: 0,
    },
    {
      id: 3,
      question: 'Do you need to wrap your component tree in Context `<Provider>` components to use Zustand?',
      options: [
        'No, Zustand stores can be accessed anywhere without Context Providers',
        'Yes, you must wrap every page in a ZustandProvider',
        'Only in production mode',
        'Yes, but only in Next.js',
      ],
      correctAnswer: 0,
    },
  ],
};

export const LESSON_8_QUIZ: IQuiz = {
  id: 'quiz_l8',
  sectionId: 's3',
  lessonId: 'l8',
  courseTitle: 'Complete React Development',
  sectionTitle: 'Lesson 8 Quiz: React Router Nested Layouts',
  assessmentBadge: 'Lesson 8 Micro-Quiz',
  passingScore: 60,
  isFinalCapstone: false,
  questions: [
    {
      id: 1,
      question: 'Which component is provided by React Router to render child routes inside a parent layout?',
      options: ['<Outlet />', '<Children />', '<Slot />', '<Yield />'],
      correctAnswer: 0,
    },
    {
      id: 2,
      question: 'Which element is used to navigate between views without triggering a full page reload?',
      options: ['<Link to="...">', '<a href="...">', '<navigate url="...">', '<button action="...">'],
      correctAnswer: 0,
    },
    {
      id: 3,
      question: 'Which hook extracts dynamic route parameters (e.g. `/course/:id`) in React Router?',
      options: ['useParams()', 'useRouterPath()', 'useLocationQuery()', 'useUrlState()'],
      correctAnswer: 0,
    },
  ],
};

export const ALL_QUIZZES: Record<string, IQuiz> = {
  // Section Comprehensive Exams
  s1: SECTION_1_QUIZ,
  s2: SECTION_2_QUIZ,
  s3: SECTION_3_QUIZ,
  'quiz-s1': SECTION_1_QUIZ,
  'quiz-s2': SECTION_2_QUIZ,
  'quiz-s3': SECTION_3_QUIZ,

  // Lesson Micro-Quizzes
  quiz_l1: LESSON_1_QUIZ,
  quiz_l2: LESSON_2_QUIZ,
  quiz_l3: LESSON_3_QUIZ,
  quiz_l4: LESSON_4_QUIZ,
  quiz_l5: LESSON_5_QUIZ,
  quiz_l6: LESSON_6_QUIZ,
  quiz_l7: LESSON_7_QUIZ,
  quiz_l8: LESSON_8_QUIZ,
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
