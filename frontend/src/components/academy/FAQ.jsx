import { useState } from "react";
import Container from "../common/Container";

function FAQ() {
  const [open, setOpen] = useState(0);

  const questions = [
    {
      question:
        "Who can join AxelPath Academy?",
      answer:
        "Learners interested in technology can explore the available learning paths based on their current skill level."
    },
    {
      question:
        "Are the programs project-based?",
      answer:
        "The Academy experience is designed around practical learning and project implementation."
    },
    {
      question:
        "Do I need prior experience?",
      answer:
        "Requirements depend on the individual course. Beginner-friendly paths are available."
    },
    {
      question:
        "How can I apply?",
      answer:
        "Explore the available courses and follow the application or enrollment process provided for the selected program."
    }
  ];

  return (
    <section className="section faq-section">
      <Container>
        <div className="faq-layout">
          <div>
            <span className="section-eyebrow">
              FAQ
            </span>

            <h2>
              Questions?
              <span className="gradient-text">
                {" "}We've got answers.
              </span>
            </h2>
          </div>

          <div className="faq-list">
            {questions.map((item, index) => (
              <div
                className={`faq-item ${
                  open === index
                    ? "open"
                    : ""
                }`}
                key={item.question}
              >
                <button
                  onClick={() =>
                    setOpen(
                      open === index
                        ? -1
                        : index
                    )
                  }
                >
                  {item.question}

                  <span>
                    {open === index
                      ? "−"
                      : "+"}
                  </span>
                </button>

                {open === index && (
                  <p>{item.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default FAQ;