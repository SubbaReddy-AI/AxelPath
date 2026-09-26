import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function CourseCard({ course }) {
  if (!course) return null;
  const { slug, title, description, image, category = "Technology", level = "Beginner" } = course;

  return (
    <motion.article className="course-card premium-simple-card" whileHover={{ y: -7 }} transition={{ duration: 0.22 }}>
      <Link to={`/academy/courses/${slug}`} className="premium-card-image-link" aria-label={`View ${title}`}>
        <div className="course-card-image premium-card-image">
          {image ? <img src={image} alt={title} loading="lazy" /> : <div className="course-card-placeholder">QK</div>}
          <span className="premium-image-tag">AxelPath Academy</span>
        </div>
      </Link>
      <div className="qk-card-media-title premium-card-title">
        <span>{category}</span>
        <strong>{title}</strong>
      </div>
      <div className="course-card-body premium-card-body">
        <span className="premium-level">{level}</span>
        <p>{description}</p>
        <Link to={`/register-course?course=${encodeURIComponent(slug)}`} className="premium-text-link">Register for Course <ArrowUpRight size={17} /></Link>
      </div>
    </motion.article>
  );
}
