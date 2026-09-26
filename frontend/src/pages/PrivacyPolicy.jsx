import Container from "../components/common/Container";

function PrivacyPolicy() {
  return (
    <section className="legal-page">
      <Container>
        <span className="section-eyebrow">
          Legal
        </span>

        <h1>
          Privacy
          <span className="gradient-text">
            {" "}Policy
          </span>
        </h1>

        <div className="legal-content">
          <h2>1. Introduction</h2>

          <p>
            AxelPath respects the privacy of
            visitors, learners, applicants,
            clients and users of its digital
            platforms.
          </p>

          <h2>2. Information We Collect</h2>

          <p>
            Information may be provided when you
            contact us, apply for opportunities,
            subscribe to communications or use
            our services.
          </p>

          <h2>3. Use of Information</h2>

          <p>
            Information is used to respond to
            enquiries, process applications,
            provide services and improve our
            digital experiences.
          </p>

          <h2>4. Data Protection</h2>

          <p>
            We take reasonable measures to protect
            information against unauthorized access,
            alteration or disclosure.
          </p>

          <h2>5. Contact</h2>

          <p>
            For privacy-related questions,
            contact AxelPath through the official
            contact channels.
          </p>
        </div>
      </Container>
    </section>
  );
}

export default PrivacyPolicy;