/**
 * Tracks used by the migration script. Each `category` is the slug of a
 * category from ./categories, matching the Track schema in dbTrack.js.
 */
module.exports = [
  {
    title: "Frontend Engineering",
    slug: "frontend-engineering",
    category: "web-development",
    description:
      "Master the browser platform: semantic markup, modern CSS, and component-driven JavaScript.",
    requiredSkills: [
      { skill: "HTML5", level: "beginner" },
      { skill: "CSS3", level: "beginner" },
      { skill: "JavaScript ES2023", level: "intermediate" },
      { skill: "TypeScript", level: "intermediate" },
    ],
  },
  {
    title: "Backend With Node.js",
    slug: "backend-with-nodejs",
    category: "web-development",
    description:
      "Design REST APIs, model data, authenticate users and deploy production Node services.",
    requiredSkills: [
      { skill: "Node.js", level: "intermediate" },
      { skill: "Express", level: "beginner" },
      { skill: "MongoDB", level: "intermediate" },
      { skill: "REST API Design", level: "intermediate" },
    ],
  },
  {
    title: "Python For Data Science",
    slug: "python-for-data-science",
    category: "data-science",
    description:
      "Analyse datasets with pandas, NumPy and SQL, then communicate findings clearly.",
    requiredSkills: [
      { skill: "Python", level: "beginner" },
      { skill: "Pandas", level: "intermediate" },
      { skill: "SQL", level: "intermediate" },
    ],
  },
  {
    title: "Machine Learning Engineering",
    slug: "machine-learning-engineering",
    category: "data-science",
    description:
      "Build, train and evaluate models that solve real problems, responsibly.",
    requiredSkills: [
      { skill: "Machine Learning", level: "advanced" },
      { skill: "Statistics", level: "intermediate" },
      { skill: "Model Deployment", level: "advanced" },
    ],
  },
  {
    title: "React Native Apps",
    slug: "react-native-apps",
    category: "mobile-development",
    description:
      "Build one codebase for iOS and Android with a native feel and smooth performance.",
    requiredSkills: [
      { skill: "React", level: "intermediate" },
      { skill: "React Native", level: "intermediate" },
      { skill: "Mobile Performance", level: "advanced" },
    ],
  },
  {
    title: "Product Design Fundamentals",
    slug: "product-design-fundamentals",
    category: "ui-ux-design",
    description:
      "Run a design process from user research to a tested, accessible prototype.",
    requiredSkills: [
      { skill: "User Research", level: "beginner" },
      { skill: "Figma", level: "beginner" },
      { skill: "Design Systems", level: "intermediate" },
    ],
  },
  {
    title: "Digital Marketing Strategy",
    slug: "digital-marketing-strategy",
    category: "business-marketing",
    description:
      "Plan campaigns, measure return on spend, and grow an audience that converts.",
    requiredSkills: [
      { skill: "SEO", level: "beginner" },
      { skill: "Analytics", level: "intermediate" },
      { skill: "Content Strategy", level: "intermediate" },
    ],
  },
  {
    title: "DevOps On Cloud",
    slug: "devops-on-cloud",
    category: "cloud-devops",
    description:
      "Automate delivery with containers, continuous integration and infrastructure as code.",
    requiredSkills: [
      { skill: "Docker", level: "intermediate" },
      { skill: "CI/CD", level: "intermediate" },
      { skill: "AWS", level: "advanced" },
    ],
  },
];