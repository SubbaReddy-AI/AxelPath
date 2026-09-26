import { motion } from "framer-motion";
import {
  ArrowRight,
  Lightbulb,
  Rocket,
  Target,
} from "lucide-react";

const milestones = [
  {
    icon: Lightbulb,
    title: "The Idea",
    text:
      "AxelPath began with a simple idea: make modern technology more practical, accessible, and impactful.",
  },
  {
    icon: Target,
    title: "The Purpose",
    text:
      "Our focus is solving meaningful problems through software, artificial intelligence, and digital innovation.",
  },
  {
    icon: Rocket,
    title: "The Journey",
    text:
      "We continue to build products, services, and learning experiences that help people and businesses move forward.",
  },
];

export default function OurStory() {
  return (
    <section className="our-story">
      <div className="container">

        <div className="our-story-heading">
          <span className="section-eyebrow">
            Our Story
          </span>

          <h2>
            From an idea to a
            <span> technology journey.</span>
          </h2>

          <p>
            Our story is driven by curiosity,
            continuous learning, and the belief
            that technology should create
            meaningful outcomes.
          </p>
        </div>

        <div className="our-story-grid">
          {milestones.map(
            (item, index) => {
              const Icon = item.icon;

              return (
                <motion.article
                  className="story-card"
                  key={item.title}
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
                    duration: 0.55,
                    delay:
                      index * 0.12,
                  }}
                >
                  <div className="story-card-number">
                    0{index + 1}
                  </div>

                  <div className="story-card-icon">
                    <Icon size={25} />
                  </div>

                  <h3>{item.title}</h3>

                  <p>{item.text}</p>

                  <div className="story-card-arrow">
                    <ArrowRight
                      size={18}
                    />
                  </div>
                </motion.article>
              );
            }
          )}
        </div>

      </div>
    </section>
  );
}