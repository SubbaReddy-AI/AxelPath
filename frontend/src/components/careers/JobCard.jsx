import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BriefcaseBusiness,
} from "lucide-react";

export default function JobCard({ job }) {
  if (!job) return null;

  const {
    slug,
    title = "Open Position",
    description = "Join AxelPath and work on meaningful technology projects.",
    department = "Technology",
  } = job;

  return (
    <motion.article
      className="job-card"
      initial={{
        opacity: 0,
        y: 25,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      whileHover={{
        y: -7,
      }}
      transition={{
        duration: 0.35,
      }}
    >
      <div className="job-card-image">
        <img src={job.image || "/images/career.svg"} alt="" loading="lazy" />
      </div>

      <div className="job-card-top">
        <div className="job-card-icon">
          <BriefcaseBusiness size={24} />
        </div>

        <span className="job-card-department">
          {department}
        </span>
      </div>

      <div className="job-card-content">
        <h3>{title}</h3>

        <p>{description}</p>

        <div className="job-card-focus"><span>Build meaningful products</span><span>Learn with strong teams</span></div>
      </div>

      <div className="job-card-footer">
        <span className="job-card-apply-text">
          Explore opportunity
        </span>

        <Link
          to={`/careers/${slug}`}
          className="job-card-link"
          aria-label={`View ${title}`}
        >
          <ArrowUpRight size={19} />
        </Link>
      </div>
    </motion.article>
  );
}