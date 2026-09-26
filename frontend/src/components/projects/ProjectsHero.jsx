import Container from "../common/Container";

function ProjectsHero() {
  return (
    <section className="inner-hero projects-hero">
      <Container>
        <span className="section-eyebrow">
          Our Work
        </span>

        <h1>
          Ideas become
          <span className="gradient-text">
            {" "}products here.
          </span>
        </h1>

        <p>
          Explore technology projects,
          experiments and digital solutions
          built by AxelPath.
        </p>
      </Container>
    </section>
  );
}

export default ProjectsHero;