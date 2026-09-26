import { Link, useParams } from "react-router-dom";
import internships from "../../data/internships";
import Container from "../../components/common/Container";

function InternshipDetails() {
  const { slug } = useParams();
  const internship = internships.find((item) => item.slug === slug);

  if (!internship) return <section className="detail-page"><Container><h1>Internship not found</h1><Link className="btn btn-primary" to="/internships">View internships</Link></Container></section>;

  return (
    <section className="detail-page premium-detail-page">
      <Container>
        <div className="detail-hero-grid">
          <div>
            <span className="section-eyebrow">AxelPath Internship</span>
            <h1>{internship.title}</h1>
            <p className="detail-description">{internship.description}</p>
            <div className="detail-focus-list">
              <span>✓ Practical project experience</span>
              <span>✓ Mentor-guided learning</span>
              <span>✓ Portfolio-ready work</span>
              <span>✓ Industry-focused workflow</span>
            </div>
            <Link to={`/internships/${internship.slug}/apply`} className="btn btn-primary">Apply for Internship →</Link>
          </div>
          <div className="detail-image-wrap premium-detail-image">
            <img src={internship.image} alt={internship.title} />
            <div className="qk-card-media-title"><span>{internship.domain}</span><strong>{internship.title}</strong></div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default InternshipDetails;
