import { motion } from "framer-motion";
import {
  Eye,
  Flag,
  Sparkles,
} from "lucide-react";

const items = [
  {
    icon: Flag,
    label: "Our Mission",
    title:
      "Turn technology into meaningful solutions.",
    description:
      "Our mission is to build reliable, intelligent, and scalable technology solutions while creating practical opportunities for people to learn and grow with technology.",
  },
  {
    icon: Eye,
    label: "Our Vision",
    title:
      "Shape a smarter digital future.",
    description:
      "Our vision is to become a trusted technology ecosystem where innovation, artificial intelligence, engineering, and learning come together to create lasting value.",
  },
];

export default function MissionVision() {
  return (
    <section className="mission-vision">
      <div className="container">

        <div className="mission-vision-header">
          <span className="section-eyebrow">
            Mission & Vision
          </span>

          <h2>
            What drives
            <span> AxelPath.</span>
          </h2>
        </div>

        <div className="mission-vision-grid">
          {items.map(
            (item, index) => {
              const Icon = item.icon;

              return (
                <motion.article
                  key={item.label}
                  className={`mission-card mission-card-${index + 1}`}
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
                    delay:
                      index * 0.15,
                  }}
                >
                  <div className="mission-card-top">
                    <div className="mission-card-icon">
                      <Icon size={27} />
                    </div>

                    <Sparkles size={18} />
                  </div>

                  <span className="mission-card-label">
                    {item.label}
                  </span>

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.description}
                  </p>
                </motion.article>
              );
            }
          )}
        </div>

      </div>
    </section>
  );
}