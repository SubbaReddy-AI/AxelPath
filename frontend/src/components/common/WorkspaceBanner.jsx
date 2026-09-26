import { useLocation } from "react-router-dom";
import "./WorkspaceBanner.css";

const pageNames = {
  "/about": "Inside AxelPath",
  "/services": "Technology & Engineering",
  "/academy": "AxelPath Academy",
  "/academy/courses": "Learn With AxelPath",
  "/internships": "Build Experience",
  "/projects": "What We Build",
  "/careers": "Build Your Career",
  "/contact": "Start a Conversation",
};

function WorkspaceBanner() {
  const { pathname } = useLocation();
  if (pathname === "/") return null;

  const title = pageNames[pathname] || "AxelPath Workspace";

  return (
    <section className="qk-workspace-banner" aria-label="AxelPath workspace">
      <div className="qk-workspace-banner-image" />
      <div className="qk-workspace-banner-overlay" />
      <div className="container qk-workspace-banner-content">
        <div>
          <span className="qk-workspace-banner-kicker">AxelPath / WORKSPACE</span>
          <h2>{title}</h2>
          <p>People, ideas and technology working together.</p>
        </div>
        <img src="/logo/AxelPath-icon.png" alt="AxelPath" />
      </div>
    </section>
  );
}

export default WorkspaceBanner;
