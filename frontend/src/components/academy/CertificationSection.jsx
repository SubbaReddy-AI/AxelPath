import {
  Award,
  CheckCircle2
} from "lucide-react";

import Container from "../common/Container";

function CertificationSection() {
  const points = [
    "Course completion recognition",
    "Project-based evaluation",
    "Practical skill development",
    "Portfolio-ready projects"
  ];

  return (
    <section className="section certification-section">
      <Container>
        <div className="certification-box">
          <div className="certification-icon">
            <Award size={45} />
          </div>

          <div>
            <span className="section-eyebrow">
              Certification
            </span>

            <h2>
              Show what you
              <span className="gradient-text">
                {" "}can build.
              </span>
            </h2>

            <p>
              Learning becomes more meaningful when
              it is supported by demonstrable work
              and practical outcomes.
            </p>

            <div className="academy-cert-image">
              <img
                src="/imge/academy/04-certification.svg"
                alt="AxelPath Academy certification"
                loading="lazy"
              />
            </div>

            <div className="certification-list">
              {points.map((point) => (
                <div key={point}>
                  <CheckCircle2 size={17} />
                  {point}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default CertificationSection;