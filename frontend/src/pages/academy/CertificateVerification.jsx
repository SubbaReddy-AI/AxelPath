import { useState } from "react";
import "../../styles/certificate.css";

function CertificateVerification() {
  const [certificateId, setCertificateId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const verifyCertificate = async (event) => {
    event.preventDefault();
    setResult(null);
    if (!certificateId.trim()) {
      setResult({ success: false, message: "Please enter a certificate ID." });
      return;
    }
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/v1/certificates/verify/${encodeURIComponent(certificateId.trim())}`);
      const data = await response.json();
      if (!response.ok) {
        setResult({ success: false, message: data.detail || "Certificate could not be verified." });
        return;
      }
      setResult({ success: true, data });
    } catch (error) {
      setResult({ success: false, message: "Backend is unavailable. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="certificate-page section">
      <div className="certificate-backdrop" />
      <div className="container">
        <div className="certificate-brand">
          <img src="/logo/AxelPath-logo-premium.png" alt="AxelPath company logo" />
          <div className={`certificate-light ${result?.success ? "is-green" : result?.success === false ? "is-red" : ""}`}>
            <span />
            <strong>{result?.success ? "Verified" : result?.success === false ? "Not Verified" : "Ready to Verify"}</strong>
          </div>
        </div>

        <div className="section-header center certificate-header">
          <span className="section-eyebrow">AxelPath ACADEMY</span>
          <h1>Verify your <span>certificate.</span></h1>
          <p>Enter the certificate ID issued by AxelPath. A valid certificate will show a green verification light and certificate details.</p>
        </div>

        <div className="certificate-card">
          <div className="certificate-card-top">
            <div><span className="certificate-label">AUTHENTICITY CHECK</span><h2>Certificate Verification</h2></div>
            <div className="certificate-shield">✓</div>
          </div>
          <form onSubmit={verifyCertificate} className="certificate-form">
            <input type="text" className="form-control" placeholder="Enter certificate ID • AP-2026-0001" value={certificateId} onChange={(event) => setCertificateId(event.target.value)} />
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Checking..." : "Verify Certificate →"}</button>
          </form>

          {result && (
            <div className={`certificate-result ${result.success ? "success" : "error"}`}>
              {result.success ? (
                <>
                  <div className="verified-line"><span className="verified-dot">✓</span><div><strong>Certificate verified successfully</strong><small>AxelPath authentication passed</small></div></div>
                  <div className="certificate-details">
                    <p><strong>Name</strong><span>{result.data.name}</span></p>
                    <p><strong>Program</strong><span>{result.data.program}</span></p>
                    <p><strong>Certificate ID</strong><span>{result.data.certificate_id}</span></p>
                    <p><strong>Issued Date</strong><span>{result.data.issued_date}</span></p>
                    <p><strong>Status</strong><span>{result.data.status}</span></p>
                  </div>
                </>
              ) : <div className="verified-line"><span className="verified-dot error-dot">!</span><div><strong>Verification failed</strong><small>{result.message}</small></div></div>}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default CertificateVerification;
