import { Link } from "react-router-dom";

function InternshipPreview() {
  return (
    <section className="section qk-internship-section">
      <div className="container">
        <div className="qk-internship-banner">
          <div className="qk-internship-image">
            <img src="/images/home/dont-just-learn-ship-real-work.webp" alt="Don’t just learn. Ship real work. — AxelPath" loading="lazy" />
            <div className="qk-media-caption"><span>Featured Internship</span><strong>AI Agent Development Internship</strong></div>
          </div>
          <div className="qk-internship-content">
            <span className="section-eyebrow">Career Launchpad</span>
            <h2>Don't just learn. <span>Ship real work.</span></h2>
            <p>Choose from six focused internship tracks with practical assignments, mentor feedback and portfolio-ready outcomes.</p>
            <Link to="/internships" className="btn btn-primary">Explore Internships <span>→</span></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default InternshipPreview;
