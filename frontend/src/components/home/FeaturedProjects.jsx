import { Link } from "react-router-dom";
import { projects } from "../../data/projects";

function FeaturedProjects() {
  return (
    <section className="section qk-projects-section">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">Selected Work</span>
          <h2>Technology that <span>ships.</span></h2>
          <p>Six focused examples of the AI, data and software experiences AxelPath is built to deliver.</p>
        </div>

        <div className="qk-project-grid qk-project-grid-premium">
          {projects.slice(0, 6).map((project) => (
            <Link to={`/projects/${project.slug}`} className="qk-project-card" key={project.id}>
              <div className="qk-project-image">
                <img src={project.image} alt={project.title} loading="lazy" />
                <div className="qk-project-overlay" />
                <span className="qk-project-chip">{project.category}</span>
              </div>
              <div className="qk-project-content">
                <span>{project.category}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <strong>View case study <span>↗</span></strong>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProjects;
