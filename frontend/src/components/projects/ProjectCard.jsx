import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, ExternalLink, Github } from "lucide-react";

export default function ProjectCard({ project }) {
  if (!project) return null;
  const { slug, title = "AxelPath Project", description = "A technology solution developed by AxelPath.", image, category = "Technology", technologies = [], featured = false, live_url, github_url } = project;

  return (
    <motion.article className="project-card" initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} whileHover={{ y: -6 }} transition={{ duration: 0.28 }}>
      <div className="project-card-image">
        {image ? <img src={image} alt={title} loading="lazy" /> : <div className="project-card-placeholder"><span>QK</span></div>}
        {featured && <span className="project-card-featured">Featured</span>}
      </div>
      <div className="qk-card-media-title"><span>AxelPath Project</span><strong>{title}</strong></div>
      <div className="project-card-body">
        <span className="project-card-category">{category}</span>
        <p>{description}</p>
        {technologies.length > 0 && <div className="project-card-technologies">{technologies.slice(0, 5).map((technology) => <span key={technology}>{technology}</span>)}</div>}
        <div className="project-card-footer">
          <Link to={`/projects/${slug}`} className="project-card-details">Case Study <ArrowUpRight size={17} /></Link>
          <div className="project-card-actions">
            {github_url && <a href={github_url} target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={17} /></a>}
            {live_url && <a href={live_url} target="_blank" rel="noreferrer" aria-label="Live project"><ExternalLink size={17} /></a>}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
