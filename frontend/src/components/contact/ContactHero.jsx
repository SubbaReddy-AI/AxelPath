import Container from "../common/Container";

function ContactHero() {
  return (
    <section className="inner-hero contact-hero">
      <Container>
        <span className="section-eyebrow">
          Contact AxelPath
        </span>

        <h1>
          Let's turn your idea into
          <span className="gradient-text">
            {" "}something real.
          </span>
        </h1>

        <p>
          Tell us what you are building, what
          problem you are solving or where you
          need technology guidance.
        </p>
      </Container>
    </section>
  );
}

export default ContactHero;