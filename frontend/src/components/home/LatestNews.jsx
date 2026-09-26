import { Link } from "react-router-dom";

function LatestNews() {
  return (
    <section className="section qk-news-section">

      <div className="container">

        <div className="section-header">

          <span className="section-eyebrow">
            Insights
          </span>

          <h2>
            What's happening at
            <span> AxelPath.</span>
          </h2>

          <p>
            Technology insights, company updates,
            academy news and announcements.
          </p>

        </div>

        <div className="qk-news-grid">

          <Link
            to="/news"
            className="qk-news-card card"
          >
            <span>
              Technology
            </span>

            <h3>
              Future-ready technology insights
            </h3>

            <p>
              Explore articles and updates from
              AxelPath.
            </p>

            <strong>
              Read More →
            </strong>
          </Link>

          <Link
            to="/news"
            className="qk-news-card card"
          >
            <span>
              Academy
            </span>

            <h3>
              Learning and development
            </h3>

            <p>
              Discover new learning opportunities
              and programs.
            </p>

            <strong>
              Read More →
            </strong>
          </Link>

          <Link
            to="/news"
            className="qk-news-card card"
          >
            <span>
              AxelPath
            </span>

            <h3>
              Company updates
            </h3>

            <p>
              Follow our latest announcements and
              developments.
            </p>

            <strong>
              Read More →
            </strong>
          </Link>

        </div>

      </div>

    </section>
  );
}

export default LatestNews;