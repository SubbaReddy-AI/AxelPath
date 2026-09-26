import { motion } from "framer-motion";
import {
  ArrowDown,
  BrainCircuit,
  Code2,
  Cloud,
  Database
} from "lucide-react";

import Container from "../common/Container";

function ServiceHero() {
  return (
    <section className="inner-hero service-hero">
      <div className="inner-hero-grid" />

      <div className="inner-hero-glow" />

      <Container>
        <div className="inner-hero-layout">
          <motion.div
            className="inner-hero-content"
            initial={{
              opacity: 0,
              y: 30
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.7
            }}
          >
            <span className="section-eyebrow">
              What We Build
            </span>

            <h1>
              Technology that
              <span className="gradient-text">
                {" "}moves businesses forward.
              </span>
            </h1>

            <p>
              From artificial intelligence and
              software engineering to cloud,
              data and digital products,
              AxelPath builds technology around
              real-world problems.
            </p>
          </motion.div>

          <div className="service-hero-orbit">
            <div className="service-orbit-center">
              <BrainCircuit size={42} />
            </div>

            <div className="service-orbit-node service-node-1">
              <Code2 size={22} />
            </div>

            <div className="service-orbit-node service-node-2">
              <Cloud size={22} />
            </div>

            <div className="service-orbit-node service-node-3">
              <Database size={22} />
            </div>
          </div>
        </div>

        <div className="inner-hero-scroll">
          <ArrowDown size={15} />
          Explore our capabilities
        </div>
      </Container>
    </section>
  );
}

export default ServiceHero;