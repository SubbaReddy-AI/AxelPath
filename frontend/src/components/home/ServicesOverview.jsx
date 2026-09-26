import SectionTitle from "../common/SectionTitle";
import ServiceCard from "./ServiceCard";

const services = [
  {
    number: "01",
    title: "Cloud & DevOps",
    description:
      "Reliable cloud infrastructure, deployment automation and scalable systems.",
    icon: "CLOUD",
    image: "/images/technology/01-cloud-devops.png",
    path: "/services",
  },
  {
    number: "02",
    title: "Data & Analytics",
    description:
      "Data-driven dashboards, analytics systems and actionable business intelligence.",
    icon: "DATA",
    image: "/images/technology/02-data-analytics.png",
    path: "/services",
  },
  {
    number: "03",
    title: "Software Development",
    description:
      "Scalable web platforms, business applications and modern software products.",
    icon: "DEV",
    image: "/images/technology/03-software-development.png",
    path: "/services",
  },
  {
    number: "04",
    title: "AI & Machine Learning",
    description:
      "Intelligent systems, machine learning solutions and AI-powered applications.",
    icon: "AI",
    image: "/images/technology/04-ai-machine-learning.png",
    path: "/services",
  },
];

function ServicesOverview() {
  return (
    <section className="section qk-services-section">
      <div className="qk-section-glow qk-home-glow-left" />
      <div className="container">
        <SectionTitle
          eyebrow="What We Build"
          title="Technology that moves businesses forward."
          description="From intelligent systems to scalable digital products, AxelPath brings technology, creativity and engineering together."
        />

        <div className="qk-service-grid">
          {services.map((service) => (
            <ServiceCard key={service.number} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesOverview;
