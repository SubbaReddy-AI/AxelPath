import { useEffect, useState } from "react";
import "./PageLoader.css";

function PageLoader() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2100);
    return () => clearTimeout(timer);
  }, []);
  if (!visible) return null;
  return (
    <div className="qk-loader" aria-label="Loading AxelPath">
      <div className="qk-loader-noise" />
      <div className="qk-loader-grid" />
      <div className="qk-loader-orbit qk-loader-orbit-one" />
      <div className="qk-loader-orbit qk-loader-orbit-two" />
      <div className="qk-loader-scan" />
      <div className="qk-loader-content">
        <div className="qk-loader-logo-shell">
          <div className="qk-loader-logo-glow" />
          <div className="qk-loader-ring ring-one" />
          <div className="qk-loader-ring ring-two" />
          <img src="/logo/AxelPath-icon.png" alt="AxelPath" />
        </div>
        <div className="qk-loader-tagline">CODE <span>•</span> CREATE <span>•</span> ELEVATE</div>
        <div className="qk-loader-progress"><span /></div>
        <div className="qk-loader-meta"><span>AP / 2026</span><span>INITIALIZING EXPERIENCE</span></div>
      </div>
    </div>
  );
}

export default PageLoader;
