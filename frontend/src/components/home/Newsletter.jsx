import { useState } from "react";

function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim()) {
      return;
    }

    setEmail("");
  };

  return (
    <section className="section qk-newsletter-section">

      <div className="container">

        <div className="qk-newsletter">

          <div>

            <span className="section-eyebrow">
              Stay Connected
            </span>

            <h2>
              Technology worth
              <span> knowing.</span>
            </h2>

            <p>
              Get AxelPath updates and insights
              directly in your inbox.
            </p>

          </div>

          <form
            className="qk-newsletter-form"
            onSubmit={handleSubmit}
          >

            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />

            <button
              type="submit"
              className="btn btn-primary"
            >
              Subscribe
            </button>

          </form>

        </div>

      </div>

    </section>
  );
}

export default Newsletter;