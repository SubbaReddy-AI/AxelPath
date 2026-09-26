import Container from "../components/common/Container";

function TermsConditions() {
  return (
    <section className="legal-page">
      <Container>
        <span className="section-eyebrow">
          Legal
        </span>

        <h1>
          Terms &
          <span className="gradient-text">
            {" "}Conditions
          </span>
        </h1>

        <div className="legal-content">
          <h2>1. Website Use</h2>

          <p>
            By using the AxelPath website,
            visitors agree to use the website
            responsibly and lawfully.
          </p>

          <h2>2. Intellectual Property</h2>

          <p>
            Website content, branding, designs,
            software and original materials may
            be protected by applicable intellectual
            property laws.
          </p>

          <h2>3. Services</h2>

          <p>
            Service information provided on the
            website is for general informational
            purposes and may change.
          </p>

          <h2>4. Applications</h2>

          <p>
            Internship and employment applications
            are subject to review and selection
            processes.
          </p>

          <h2>5. Changes</h2>

          <p>
            AxelPath may update these terms when
            necessary.
          </p>
        </div>
      </Container>
    </section>
  );
}

export default TermsConditions;