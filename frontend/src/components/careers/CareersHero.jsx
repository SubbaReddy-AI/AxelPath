import Container from "../common/Container";

function CareersHero() {
  return (
    <section className="inner-hero careers-hero">
      <Container>
        <span className="section-eyebrow">
          Careers at AxelPath
        </span>

        <h1>
          Build the future.
          <span className="gradient-text">
            {" "}With us.
          </span>
        </h1>

        <p>
          Join a technology-focused environment
          where learning, engineering and
          ambitious ideas come together.
        </p>
      </Container>
    </section>
  );
}

export default CareersHero;