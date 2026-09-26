import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="qk-hero qk-hero-workspace">
      <div className="qk-workspace-backdrop" aria-hidden="true" />
      <div className="qk-workspace-overlay" aria-hidden="true" />
      <div className="qk-hero-grid" aria-hidden="true" />
      <div className="qk-hero-glow qk-hero-glow-one" />
      <div className="qk-hero-glow qk-hero-glow-two" />

      <div className="container qk-hero-container qk-hero-container-background-art">
        <div className="qk-hero-content">
          <div className="qk-hero-badge qk-fade-up">
            <span className="qk-status-dot" />
            AxelPath • AI • SOFTWARE • CLOUD
          </div>

          <p className="qk-hero-eyebrow qk-fade-up">A technology team built to ship what matters.</p>

          <h1 className="qk-hero-title qk-fade-up">
            Build smarter.
            <span>Launch with confidence.</span>
          </h1>

          <p className="qk-hero-description qk-fade-up">
            AxelPath brings product engineering, AI, cloud and practical learning together in one place — helping teams turn ambitious ideas into useful digital products and helping learners become job-ready.
          </p>

          <div className="qk-hero-actions qk-fade-up">
            <Link to="/register-course" className="btn btn-primary">Register for a Course <span>→</span></Link>
            <Link to="/projects" className="btn btn-secondary">View Our Projects</Link>
          </div>

          <div className="qk-hero-trust qk-fade-up">
            <span>Working across</span>
            <div className="qk-tech-mini">AI & GenAI</div>
            <div className="qk-tech-mini">Cloud</div>
            <div className="qk-tech-mini">Data</div>
            <div className="qk-tech-mini">Engineering</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
