import { Link, useParams } from "react-router-dom";
import courses from "../../data/courses";
import Container from "../../components/common/Container";

function CourseDetails() {
  const { slug } = useParams();
  const course = courses.find((item) => item.slug === slug);

  if (!course) return <section className="detail-page"><Container><h1>Course not found</h1><Link className="btn btn-primary" to="/academy">View courses</Link></Container></section>;

  return (
    <section className="detail-page premium-detail-page">
      <Container>
        <div className="detail-hero-grid">
          <div>
            <span className="section-eyebrow">AxelPath Academy</span>
            <h1>{course.title}</h1>
            <p className="detail-description">{course.description}</p>
            <div className="detail-focus-list">
              {course.features?.slice(0, 4).map((feature) => <span key={feature}>✓ {feature}</span>)}
            </div>
            <Link to={`/register-course?course=${encodeURIComponent(course.slug)}`} className="btn btn-primary">Register for this course →</Link>
          </div>
          <div className="detail-image-wrap premium-detail-image">
            <img src={course.image} alt={course.title} />
            <div className="qk-card-media-title"><span>{course.category}</span><strong>{course.title}</strong></div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default CourseDetails;
