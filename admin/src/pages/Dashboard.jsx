import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  FolderKanban,
  GraduationCap,
  Mail,
  Users,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import { getDashboardStats } from "../api/adminApi";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch {
        setError(
          "Dashboard statistics could not be loaded."
        );
      }
    };

    loadStats();
  }, []);

  return (
    <div className="admin-layout">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="admin-main">
        <Header
          title="Dashboard"
          subtitle="Overview of your AxelPath platform."
          onMenuClick={() =>
            setSidebarOpen(!sidebarOpen)
          }
        />

        <div className="admin-page-content">
          {error && (
            <p className="admin-form-error">{error}</p>
          )}

          <section className="stats-grid">
            <StatCard
              title="Total Users"
              value={stats.users}
              icon={Users}
              color="purple"
            />
            <StatCard
              title="Courses"
              value={stats.courses}
              icon={GraduationCap}
              color="blue"
            />
            <StatCard
              title="Projects"
              value={stats.projects}
              icon={FolderKanban}
              color="green"
            />
            <StatCard
              title="Job Applications"
              value={stats.job_applications}
              icon={BriefcaseBusiness}
              color="orange"
            />
            <StatCard
              title="Contact Messages"
              value={stats.contacts}
              icon={Mail}
              color="pink"
            />
          </section>

          <section className="dashboard-welcome-card">
            <span>AxelPath ADMIN</span>
            <h2>Manage your platform from one place.</h2>
            <p>
              Update courses, projects, job openings,
              applications, messages, newsletter members,
              testimonials, and news.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}