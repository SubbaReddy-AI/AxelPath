import { motion } from "framer-motion";
import {
  Code2,
  Database,
  Palette,
  ShieldCheck,
  Users,
} from "lucide-react";

const teams = [
  {
    icon: Code2,
    title: "Engineering",
    text:
      "Software engineers building scalable digital products and platforms.",
  },
  {
    icon: Database,
    title: "AI & Data",
    text:
      "AI, machine learning, data, and intelligent application development.",
  },
  {
    icon: Palette,
    title: "Design",
    text:
      "Designing clear, modern, and user-focused digital experiences.",
  },
  {
    icon: ShieldCheck,
    title: "Cloud & DevOps",
    text:
      "Reliable infrastructure, automation, deployment, and cloud engineering.",
  },
  {
    icon: Users,
    title: "People & Learning",
    text:
      "Supporting collaboration, learning, growth, and technology education.",
  },
];

export default function TeamSection() {
  return (
    <section className="team-section">
      <div className="container">

        <div className="team-heading">
          <span className="section-eyebrow">
            Our Team
          </span>

          <h2>
            Different skills.
            <span> One direction.</span>
          </h2>

          <p>
            AxelPath brings different areas of
            expertise together to turn ideas into
            useful technology.
          </p>
        </div>

        <div className="team-grid">
          {teams.map(
            (team, index) => {
              const Icon = team.icon;

              return (
                <motion.article
                  className="team-card"
                  key={team.title}
                  initial={{
                    opacity: 0,
                    scale: 0.96,
                  }}
                  whileInView={{
                    opacity: 1,
                    scale: 1,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 0.5,
                    delay:
                      index * 0.08,
                  }}
                >
                  <div className="team-card-icon">
                    <Icon size={25} />
                  </div>

                  <span>
                    0{index + 1}
                  </span>

                  <h3>
                    {team.title}
                  </h3>

                  <p>
                    {team.text}
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