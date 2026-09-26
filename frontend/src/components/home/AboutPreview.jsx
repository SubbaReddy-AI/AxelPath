import { Link } from "react-router-dom";

function AboutPreview() {
  return (
    <section className="section qk-about-preview">

      <div className="container qk-about-grid">

        <div className="qk-about-image">

          <div className="qk-about-image-frame">

            <img
              src="/images/home/engineering-impact.png"
              alt="Engineering ideas into real-world impact"
            />

            <div className="qk-image-overlay" />

            <div className="qk-about-floating-card">
              <span>
                QK
              </span>

              <div>
                <strong>
                  Build Better.
                </strong>

                <small>
                  Think Beyond.
                </small>
              </div>
            </div>

          </div>

        </div>

        <div className="qk-about-content">

          <span className="section-eyebrow">
            About AxelPath
          </span>

          <h2>
            Engineering ideas into
            <span> real-world impact.</span>
          </h2>

          <p>
            AxelPath is a technology-driven company
            focused on creating modern digital products,
            intelligent systems and practical technology
            solutions.
          </p>

          <p>
            We combine engineering, design, AI and
            innovation to turn ideas into meaningful
            digital experiences.
          </p>

          <Link
            to="/about"
            className="btn btn-secondary"
          >
            Discover AxelPath
            <span>→</span>
          </Link>

        </div>

      </div>

    </section>
  );
}

export default AboutPreview;