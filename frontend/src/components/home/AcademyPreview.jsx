function AcademyPreview() {
  return (
    <section className="section qk-academy-section qk-academy-image-section" aria-labelledby="academy-career-image-title">
      <div className="container">
        <h2 id="academy-career-image-title" className="sr-only">
          Learn skills that move your career.
        </h2>
        <div className="qk-academy-image-wrap">
          <img
            src="/images/home/learn-skills-career.webp"
            alt="Learn skills that move your career — AxelPath Academy"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}

export default AcademyPreview;
