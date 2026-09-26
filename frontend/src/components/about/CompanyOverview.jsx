import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function CompanyOverview() {
  const highlights = [
    "AI-first technology solutions",
    "Modern digital product development",
    "Industry-focused engineering",
    "Practical technology education",
  ];

  return (
    <section className="company-overview">
      <div className="container">
        <div className="company-overview-grid">

          <motion.div
            className="company-overview-content"
            initial={{
              opacity: 0,
              x: -35,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.7,
            }}
          >
            <span className="section-eyebrow">
              About AxelPath
            </span>

            <h2>
              Building technology
              <span>
                that creates real impact.
              </span>
            </h2>

            <p className="company-overview-lead">
              AxelPath is a technology-focused
              company delivering modern digital
              solutions, AI-powered products,
              and practical technology learning
              experiences.
            </p>

            <p>
              We bring together software engineering,
              artificial intelligence, cloud
              technologies, and product thinking
              to build solutions designed for
              real-world needs.
            </p>

            <div className="company-overview-list">
              {highlights.map(
                (item, index) => (
                  <div
                    className="company-overview-item"
                    key={index}
                  >
                    <CheckCircle2
                      size={19}
                    />
                    <span>{item}</span>
                  </div>
                )
              )}
            </div>
          </motion.div>

          <motion.div
            className="company-overview-visual"
            initial={{
              opacity: 0,
              x: 35,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.7,
              delay: 0.15,
            }}
          >
            <div className="company-overview-card">

              <div className="company-overview-card-glow" />

              <div className="company-overview-icon">
                <Building2 size={32} />
              </div>

              <span className="company-overview-card-label">
                AxelPath
              </span>

              <h3>
                Code.
                <br />
                Create.
                <br />
                Transform.
              </h3>

              <p>
                Technology engineered with
                purpose, creativity, and
                measurable impact.
              </p>

              <div className="company-overview-card-footer">
                <span>
                  Explore our journey
                </span>

                <ArrowUpRight
                  size={20}
                />
              </div>

              <div className="company-overview-decoration">
                <Sparkles size={22} />
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}