import { BriefcaseBusiness } from "lucide-react";

import Container from "../common/Container";

function InternshipHero() {
  return (
    <section className="inner-hero internship-hero">
      <Container>
        <div className="internship-hero-content">
          <span className="section-eyebrow">
            AxelPath Internships
          </span>

          <h1>
            Turn knowledge into
            <span className="gradient-text">
              {" "}experience.
            </span>
          </h1>

          <p>
            Work on practical technology projects,
            develop industry-ready skills and
            experience the engineering process.
          </p>

          <div className="internship-hero-badge">
            <BriefcaseBusiness size={18} />
            Build • Learn • Experience
          </div>
        </div>
      </Container>
    </section>
  );
}

export default InternshipHero;