import { BookOpen, ArrowRight } from "lucide-react";

import Container from "../common/Container";

function AcademyHero() {
  return (
    <section className="inner-hero academy-hero">
      <Container>
        <div className="academy-hero-layout">
          <div>
            <span className="section-eyebrow">
              AxelPath Academy
            </span>

            <h1>
              Learn.
              <span className="gradient-text">
                {" "}Build.
              </span>
              <br />
              Become future-ready.
            </h1>

            <p>
              Practical technology learning built
              around projects, mentorship and
              real engineering experience.
            </p>

            <a
              href="/academy/courses"
              className="btn btn-primary"
            >
              Explore Courses
              <ArrowRight size={18} />
            </a>
          </div>

          <div className="academy-hero-visuals">
            <div className="academy-hero-card academy-hero-card-main">
              <img
                src="/imge/academy/01-academy-hero.svg"
                alt="AxelPath Academy learning platform"
              />
              <div className="academy-hero-card-content">
                <BookOpen size={24} />
                <div>
                  <strong>Project-Based Learning</strong>
                  <span>Learn concepts by building meaningful technology.</span>
                </div>
              </div>
            </div>

            <div className="academy-hero-mini-grid">
              <div className="academy-mini-card">
                <img src="/imge/academy/02-learning-lab.svg" alt="Hands-on technology lab" />
                <strong>Hands-on Labs</strong>
              </div>
              <div className="academy-mini-card">
                <img src="/imge/academy/03-mentor-session.svg" alt="AxelPath mentor session" />
                <strong>Mentor Guidance</strong>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default AcademyHero;