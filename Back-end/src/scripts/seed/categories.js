/**
 * The four categories the product exposes. The slug is what tracks and courses
 * are keyed to, so it must match the rows the API reads.
 */
module.exports = [
  {
    name: "Web Development",
    slug: "web-development",
    icon: "\u25F2",
    description:
      "Build modern, responsive websites with HTML, CSS and JavaScript from the ground up.",
    subcategories: [
      { name: "Frontend Basics", slug: "frontend-basics" },
      { name: "Backend With Node", slug: "backend-with-node" },
      { name: "Full Stack Projects", slug: "full-stack-projects" },
    ],
  },
  {
    name: "Languages",
    slug: "languages",
    icon: "\u6587",
    description:
      "Learn spoken and written languages through structured, practical courses.",
    subcategories: [
      { name: "English", slug: "english" },
      { name: "Arabic", slug: "arabic" },
      { name: "French", slug: "french" },
    ],
  },
  {
    name: "UI/UX Design",
    slug: "ui-ux-design",
    icon: "\u25C7",
    description:
      "Design interfaces people love, from research and wireframes to polished prototypes.",
    subcategories: [
      { name: "User Research", slug: "user-research" },
      { name: "Wireframing", slug: "wireframing" },
      { name: "Prototyping", slug: "prototyping" },
    ],
  },
  {
    name: "Business",
    slug: "business",
    icon: "\u25C6",
    description:
      "Grow products and teams with strategy, branding, analytics and digital marketing.",
    subcategories: [
      { name: "Digital Marketing", slug: "digital-marketing" },
      { name: "Branding", slug: "branding" },
      { name: "Startup Basics", slug: "startup-basics" },
    ],
  },
];
