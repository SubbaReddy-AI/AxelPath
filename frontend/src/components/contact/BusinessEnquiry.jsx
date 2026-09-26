import Container from "../common/Container";

function BusinessEnquiry() {
  return (
    <section className="section business-enquiry">
      <Container>
        <div className="business-enquiry-box">
          <span className="section-eyebrow">
            Business enquiries
          </span>

          <h2>
            Looking for a
            <span className="gradient-text">
              {" "}technology partner?
            </span>
          </h2>

          <p>
            We can work with businesses, startups,
            institutions and teams that need
            technology expertise.
          </p>

          <a
            href="mailto:axelpathofficial@gmail.com"
            className="btn btn-secondary"
          >
            axelpathofficial@gmail.com
          </a>
        </div>
      </Container>
    </section>
  );
}

export default BusinessEnquiry;