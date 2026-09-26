const reasons = [
  {
    number: "01",
    title: "Innovation First",
    text:
      "We explore modern technologies to create solutions that are practical, scalable and future-ready."
  },
  {
    number: "02",
    title: "Engineering Mindset",
    text:
      "Every product starts with strong architecture, clean implementation and long-term thinking."
  },
  {
    number: "03",
    title: "Human-Centered Design",
    text:
      "Technology should feel simple to the people who use it. We design around real user needs."
  },
  {
    number: "04",
    title: "Continuous Learning",
    text:
      "Our academy and internship ecosystem connects learning with real-world technology."
  }
];

function WhyAxelPath() {
  return (
    <section className="section qk-why-section">

      <div className="container">

        <div className="section-header center">

          <span className="section-eyebrow">
            Why AxelPath
          </span>

          <h2>
            Built differently.
            <br />
            Designed for what comes next.
          </h2>

          <p>
            We focus on technology that creates
            meaningful outcomes, not technology for
            technology's sake.
          </p>

        </div>

        <div className="qk-reasons-grid">

          {reasons.map((reason) => (
            <div
              className="qk-reason-card"
              key={reason.number}
            >

              <span>
                {reason.number}
              </span>

              <h3>
                {reason.title}
              </h3>

              <p>
                {reason.text}
              </p>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}

export default WhyAxelPath;