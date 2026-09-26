import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Linkedin,
} from "lucide-react";

const leaders = [
  {
    name: "AxelPath Leadership",
    role: "Technology & Innovation",
    description:
      "Leading the vision, technology strategy, and innovation journey of AxelPath.",
  },
];

export default function Leadership() {
  return (
    <section className="leadership">
      <div className="container">

        <div className="leadership-heading">
          <span className="section-eyebrow">
            Leadership
          </span>

          <h2>
            Building with
            <span> purpose.</span>
          </h2>

          <p>
            Our leadership philosophy combines
            technology, people, learning, and
            long-term thinking.
          </p>
        </div>

        <div className="leadership-grid">
          {leaders.map(
            (leader, index) => (
              <motion.article
                className="leader-card"
                key={leader.name}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
              >
                <div className="leader-image">
                  <div className="leader-avatar">
                    QK
                  </div>

                  <div className="leader-image-glow" />
                </div>

                <div className="leader-info">
                  <span>
                    {leader.role}
                  </span>

                  <h3>
                    {leader.name}
                  </h3>

                  <p>
                    {leader.description}
                  </p>

                  <div className="leader-actions">
                    <a
                      href="#leadership"
                      aria-label="LinkedIn"
                    >
                      <Linkedin
                        size={17}
                      />
                    </a>

                    <a
                      href="#leadership"
                      aria-label="View profile"
                    >
                      <ArrowUpRight
                        size={18}
                      />
                    </a>
                  </div>
                </div>
              </motion.article>
            )
          )}
        </div>

      </div>
    </section>
  );
}