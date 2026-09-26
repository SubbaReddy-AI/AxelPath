import { useState } from "react";
import Container from "../common/Container";

function JobApplicationForm() {
  const [submitted, setSubmitted] =
    useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="detail-page">
      <Container>
        <div className="application-layout">
          <div>
            <span className="section-eyebrow">
              Careers
            </span>

            <h1>
              Apply to
              <span className="gradient-text">
                {" "}AxelPath.
              </span>
            </h1>

            <p>
              Tell us about your experience,
              skills and what you want to build.
            </p>
          </div>

          <form
            className="application-form"
            onSubmit={handleSubmit}
          >
            <input
              placeholder="Full name"
              required
            />

            <input
              type="email"
              placeholder="Email address"
              required
            />

            <input
              placeholder="Phone number"
            />

            <input
              placeholder="Position"
              required
            />

            <textarea
              rows="6"
              placeholder="Tell us about your experience"
            />

            <input
              type="file"
              accept=".pdf,.doc,.docx"
            />

            <button
              type="submit"
              className="btn btn-primary"
            >
              Submit Application
            </button>

            {submitted && (
              <p className="form-success">
                Application submitted successfully.
              </p>
            )}
          </form>
        </div>
      </Container>
    </section>
  );
}

export default JobApplicationForm;