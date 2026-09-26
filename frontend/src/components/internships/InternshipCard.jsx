import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function InternshipCard({ internship }) {
  if (!internship) return null;
  const { slug, title = "Technology Internship", description, domain = "Technology" } = internship;

  return (
    <motion.article className="internship-card premium-simple-card" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} whileHover={{ y: -7 }} transition={{ duration: 0.28 }}>
      <Link to={`/internships/${slug}`} className="premium-card-image-link" aria-label={`View ${title}`}>
        <div className="internship-card-image premium-card-image">
          <img src={internship.image || "/imge/internships/ai-ml.webp"} alt={title} loading="lazy" />
          <span className="premium-image-tag">AxelPath Internship</span>
        </div>
      </Link>
      <div className="qk-card-media-title premium-card-title">
        <span>{domain}</span>
        <strong>{title}</strong>
      </div>
      <div className="internship-card-content premium-card-body">
        <p>{description}</p>
        <Link to={`/internships/${slug}`} className="premium-text-link">Explore Internship <ArrowUpRight size={17} /></Link>
      </div>
    </motion.article>
  );
}
