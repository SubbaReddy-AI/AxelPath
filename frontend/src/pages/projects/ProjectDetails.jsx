import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import projects from "../../data/projects";
import Container from "../../components/common/Container";

function ProjectDetails() {
  const { projectId } = useParams();
  const project = projects.find((item) => item.slug === projectId);

  if (!project) return <section className="detail-page"><Container><h1>Project not found</h1><Link className="btn btn-primary" to="/projects">View projects</Link></Container></section>;

  return (
    <section className="detail-page">
      <Container>
        <Link to="/projects" className="detail-back"><ArrowLeft size={16} /> Back to projects</Link>
        <div className="detail-project-grid">
          <div className="detail-image-wrap"><img src={project.image} alt={project.title} /><div className="qk-card-media-title"><span>AxelPath Project</span><strong>{project.title}</strong></div></div>
          <div>
            <span className="section-eyebrow">{project.category}</span>
            <h1>{project.title}</h1>
            <p className="detail-description">{project.description}</p>
            <div className="project-card-technologies">{project.technologies.map((item) => <span key={item}>{item}</span>)}</div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default ProjectDetails;
