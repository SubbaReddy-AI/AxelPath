import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, CloudCog, Code2, Lightbulb, Rocket, Users, Target, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Container from "../components/common/Container";

const pillars = [
  { icon: BrainCircuit, number: "01", title: "AI & Intelligent Products", text: "Generative AI, machine learning, RAG and agentic workflows designed around useful business outcomes.", image: "/imge/projects/04-ai-machine-learning-deepfake.webp" },
  { icon: Code2, number: "02", title: "Digital Product Engineering", text: "Modern web applications, APIs and connected experiences built for speed, clarity and long-term maintainability.", image: "/imge/projects/01-software-development-full-stack.webp" },
  { icon: CloudCog, number: "03", title: "Cloud & Delivery", text: "Cloud architecture, containers, automation and DevOps practices that make shipping software more dependable.", image: "/imge/projects/02-cloud-devops-smart-city.webp" },
];

const principles = [
  { icon: Target, title: "Start with the problem", text: "We first understand the user, the business goal and the outcome before choosing technology." },
  { icon: Lightbulb, title: "Make ideas tangible", text: "We turn concepts into prototypes and working products so decisions are based on something real." },
  { icon: Users, title: "Build together", text: "Clear communication, practical feedback and shared ownership keep projects moving." },
  { icon: ShieldCheck, title: "Design for trust", text: "Clean architecture, responsible AI and dependable delivery are part of the product—not afterthoughts." },
];

export default function About() {
  return (
    <main className="about-premium-page">
      <section className="about-premium-hero">
        <Container>
          <div className="about-hero-layout">
            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }}>
              <span className="section-eyebrow">ABOUT AxelPath</span>
              <h1>Technology should create <span>momentum.</span></h1>
              <p className="about-lead">AxelPath is a technology and learning company bringing software engineering, artificial intelligence and practical career development into one ecosystem.</p>
              <div className="about-hero-actions">
                <Link to="/projects" className="btn btn-primary">See what we build <ArrowRight size={17} /></Link>
                <Link to="/contact" className="btn btn-secondary">Talk to our team</Link>
              </div>
              <div className="about-mini-stats">
                <div><strong>BUILD</strong><span>Digital products</span></div>
                <div><strong>LEARN</strong><span>Career-ready skills</span></div>
                <div><strong>GROW</strong><span>Long-term capability</span></div>
              </div>
            </motion.div>
            <motion.div className="about-hero-image" initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .8 }}>
              <img src="/imge/about/01-AxelPath-workspace.jpg" alt="AxelPath working office and technology workspace" />
              <div className="about-image-diagram" aria-label="AxelPath working flow"><strong>How AxelPath works</strong><div><i /> Discover the challenge</div><div><i /> Design the solution</div><div><i /> Build & test</div><div><i /> Launch & improve</div></div>
              <div className="about-image-badge"><Rocket size={17} /><span>Ideas → prototypes → products</span></div>
            </motion.div>
          </div>
        </Container>
      </section>

      <section className="about-belief section">
        <Container>
          <div className="about-belief-grid">
            <div><span className="section-eyebrow">WHY WE EXIST</span><h2>From learning an idea to <span>launching it.</span></h2></div>
            <div className="about-rich-copy">
              <p>Technology moves quickly. People and businesses need more than tools—they need the confidence and capability to use them well.</p>
              <p>AxelPath connects that journey. We create digital solutions, explore emerging AI capabilities and build practical learning experiences around the same technologies used in real projects.</p>
              <p>The goal is simple: make modern technology more useful, more approachable and easier to turn into measurable progress.</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="about-pillars section">
        <Container>
          <div className="about-section-heading"><span className="section-eyebrow">WHAT WE DO</span><h2>Three areas. <span>One technology mindset.</span></h2><p>Our work sits where engineering, AI and continuous learning meet.</p></div>
          <div className="about-pillar-grid">
            {pillars.map(({ icon: Icon, number, title, text, image }, i) => (
              <motion.article key={title} className="about-pillar-card" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .08 }}>
                <div className="about-pillar-image"><img src={image} alt={title} /></div>
                <div className="about-pillar-body"><div className="about-pillar-top"><span>{number}</span><Icon size={21} /></div><h3>{title}</h3><p>{text}</p></div>
              </motion.article>
            ))}
          </div>
        </Container>
      </section>

      <section className="about-work section">
        <Container>
          <div className="about-work-panel">
            <div className="about-work-image"><img src="/imge/about/02-AxelPath-team.jpg" alt="Technology team collaborating in a workspace" /></div>
            <div className="about-work-content"><span className="section-eyebrow">HOW WE WORK</span><h2>Practical, collaborative and <span>built to evolve.</span></h2><p>We do not believe in building technology for technology's sake. We focus on the outcome, build a useful first version, learn from feedback and keep improving.</p><div className="about-process"><span>01 Understand</span><span>02 Build</span><span>03 Test</span><span>04 Improve</span></div><Link to="/register-course" className="text-link">Register for a Course <ArrowRight size={17} /></Link></div>
          </div>
        </Container>
      </section>

      <section className="about-principles section">
        <Container>
          <div className="about-section-heading"><span className="section-eyebrow">OUR PRINCIPLES</span><h2>What you can expect <span>from AxelPath.</span></h2></div>
          <div className="about-principle-grid">{principles.map(({ icon: Icon, title, text }) => <article key={title} className="about-principle-card"><div className="about-principle-icon"><Icon size={20} /></div><h3>{title}</h3><p>{text}</p></article>)}</div>
        </Container>
      </section>

      <section className="about-final-cta"><Container><div className="about-final-box"><div><span className="section-eyebrow">LET'S BUILD SOMETHING USEFUL</span><h2>Have a problem, product idea or learning goal?</h2><p>Tell us what you are trying to achieve. We will help you find the right next step.</p></div><Link to="/contact" className="btn btn-primary">Send an enquiry <ArrowRight size={18} /></Link></div></Container></section>
    </main>
  );
}
