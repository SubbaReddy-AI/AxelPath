export const APP_NAME = "AxelPath";

export const APP_TAGLINE =
  "Engineering ideas into intelligent digital experiences.";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000/api";

export const SOCIAL_LINKS = {
  linkedin: "#",
  instagram: "#",
  twitter: "#",
  github: "#"
};

export const COMPANY_NAVIGATION = [
  {
    label: "About",
    path: "/about"
  },
  {
    label: "Services",
    path: "/services"
  },
  {
    label: "Projects",
    path: "/projects"
  },
  {
    label: "Careers",
    path: "/careers"
  }
];

export const BUSINESS_NAVIGATION = [
  {
    label: "Academy",
    path: "/academy"
  },
  {
    label: "Internships",
    path: "/internships"
  },
  {
    label: "Contact",
    path: "/contact"
  }
];