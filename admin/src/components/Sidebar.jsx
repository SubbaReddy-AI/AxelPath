import { NavLink } from "react-router-dom";
import {
  BriefcaseBusiness,
  Contact,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/users", label: "Users", icon: Users },
  { to: "/services", label: "Services", icon: Sparkles },
  { to: "/courses", label: "Courses", icon: GraduationCap },
  { to: "/mentors", label: "Mentors", icon: Users },
  { to: "/internships", label: "Internships", icon: BriefcaseBusiness },
  {
    to: "/internship-applications",
    label: "Internship Applications",
    icon: ShieldCheck,
  },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
  {
    to: "/job-applications",
    label: "Job Applications",
    icon: ShieldCheck,
  },
  { to: "/contacts", label: "Contacts", icon: Contact },
  { to: "/newsletter", label: "Newsletter", icon: Mail },
  {
    to: "/testimonials",
    label: "Testimonials",
    icon: MessageSquare,
  },
  { to: "/news", label: "News", icon: Newspaper },
];

export default function Sidebar({ open, onClose }) {
  return (
    <aside
      className={`admin-sidebar ${
        open ? "admin-sidebar-open" : ""
      }`}
    >
      <div className="admin-sidebar-brand">
        <img
          src="/logo/AxelPath-icon.png"
          alt="AxelPath"
          className="admin-sidebar-logo-img"
        />

        <div>
          <strong>AxelPath</strong>
          <small>Administration</small>
        </div>
      </div>

      <nav className="admin-navigation">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `admin-nav-link ${
                isActive ? "admin-nav-link-active" : ""
              }`
            }
            onClick={onClose}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}