import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  FileCheck2,
  FileText,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import courses from "../../data/courses";
import Container from "../../components/common/Container";
import AgreementModal from "../../components/agreement/AgreementModal";
import {
  initCourseRegistration,
  createPaymentOrder,
  verifyCourseRegistrationPayment,
} from "../../api/courseRegistrationApi";
import "../../styles/register-course.css";

// ─── Razorpay script loader ───────────────────────────────────────────────────
function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Razorpay Checkout could not be loaded."));
    document.body.appendChild(script);
  });
}

// ─── Step indicators ─────────────────────────────────────────────────────────
const STEPS = [
  { num: "01", label: "Details", sub: "Tell us about you" },
  { num: "02", label: "Agreement", sub: "Read & accept terms" },
  { num: "03", label: "Payment", sub: "Secure Razorpay checkout" },
  { num: "04", label: "Confirmed", sub: "Verified registration" },
];

export default function RegisterCourse() {
  const [searchParams] = useSearchParams();
  const initialSlug = searchParams.get("course") || courses[0]?.slug || "";

  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    referral_id: "",
    course_slug: initialSlug,
  });

  // ── Flow state ──────────────────────────────────────────────────────────────
  const [registrationId, setRegistrationId] = useState(null);   // set after /init
  const [agreementAccepted, setAgreementAccepted] = useState(false); // true after /agreements/accept
  const [showAgreement, setShowAgreement] = useState(false);
  const [payment, setPayment] = useState(null);   // Razorpay order details
  const [utr, setUtr] = useState("");
  const [success, setSuccess] = useState(null);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ── Derived ─────────────────────────────────────────────────────────────────
  const selectedCourse = useMemo(
    () => courses.find((c) => c.slug === form.course_slug) || courses[0],
    [form.course_slug]
  );

  const currentStep = success
    ? 3
    : payment?.paid
      ? 2
      : agreementAccepted
        ? 2
        : registrationId
          ? 1
          : 0;

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const update = (e) => {
    const { name, value } = e.target;
    setForm((cur) => ({ ...cur, [name]: value }));
    setError("");
  };

  const validate = () => {
    if (!form.full_name.trim()) { setError("Please enter your full name."); return false; }
    if (!form.email.trim()) { setError("Please enter your email address."); return false; }
    if (!form.phone.trim()) { setError("Please enter your phone number."); return false; }
    if (!form.course_slug) { setError("Please select a course."); return false; }
    return true;
  };

  // ── STEP 1 — Open agreement (init registration first if needed) ───────────
  const openAgreement = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setError("");
    setMessage("");

    // If already init'd (e.g., user reopened modal), just show it
    if (registrationId) { setShowAgreement(true); return; }

    try {
      setLoading(true);
      const res = await initCourseRegistration({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        referral_id: form.referral_id?.trim() || undefined,
        course_slug: form.course_slug,
      });
      setRegistrationId(res.registration_id);
      setShowAgreement(true);
    } catch (err) {
      setError(err.message || "Unable to continue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 2 — Agreement accepted callback ──────────────────────────────────
  const handleAgreementAccepted = () => {
    setShowAgreement(false);
    setAgreementAccepted(true);
    setMessage("Agreement accepted. You can now proceed to secure payment.");
  };

  // ── STEP 3 — Open Razorpay ────────────────────────────────────────────────
  const openRazorpay = async () => {
    if (!agreementAccepted || !registrationId) return;
    setError("");
    setMessage("");

    try {
      setLoading(true);

      // Create order on backend (verifies agreement server-side, returns NO amount)
      const order = await createPaymentOrder(registrationId);
      setPayment(order);

      await loadRazorpay();

      const razorpay = new window.Razorpay({
        key: order.razorpay_key_id,
        currency: order.currency,
        name: "AxelPath",
        description: order.course_title,
        order_id: order.razorpay_order_id,
        image: "/logo/AxelPath-logo-premium.png",
        prefill: {
          name: form.full_name,
          email: form.email,
          contact: form.phone,
        },
        notes: {
          course: order.course_title,
          registration_id: order.registration_id,
        },
        theme: { color: "#1a5eff" },
        handler: (response) => {
          // Razorpay calls this after successful payment
          setPayment((cur) => ({ ...cur, ...response, paid: true }));
          setMessage(
            "Payment completed. Enter your UTR / transaction reference to finalise verification."
          );
          setLoading(false);
        },
        modal: { ondismiss: () => setLoading(false) },
      });

      razorpay.on("payment.failed", (response) => {
        setError(
          response?.error?.description || "Payment failed. Please try again."
        );
        setLoading(false);
      });

      razorpay.open();
    } catch (err) {
      setError(err.message || "Unable to open payment. Please try again.");
      setLoading(false);
    }
  };

  // ── STEP 4 — Verify payment ───────────────────────────────────────────────
  const verifyPayment = async (e) => {
    e.preventDefault();
    if (!payment?.razorpay_payment_id || !utr.trim()) {
      setError("Enter the UTR / transaction reference received after payment.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const result = await verifyCourseRegistrationPayment({
        registration_id: payment.registration_id,
        razorpay_payment_id: payment.razorpay_payment_id,
        razorpay_order_id: payment.razorpay_order_id,
        razorpay_signature: payment.razorpay_signature,
        utr: utr.trim(),
      });
      setSuccess(result);
      setMessage("");
    } catch (err) {
      setError(err.message || "Payment verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main className="register-course-page">
      <div className="register-course-bg" aria-hidden="true" />
      <div className="register-course-orbit register-orbit-one" aria-hidden="true" />
      <div className="register-course-orbit register-orbit-two" aria-hidden="true" />

      {/* Agreement modal — shown when student clicks "View Terms & Agreement" */}
      {showAgreement && registrationId && (
        <AgreementModal
          registrationId={registrationId}
          onAccepted={handleAgreementAccepted}
          onClose={() => setShowAgreement(false)}
        />
      )}

      <Container>
        {/* ── Hero copy ────────────────────────────────────────────── */}
        <section className="register-course-hero">
          <div className="register-hero-copy">
            <div className="register-kicker">
              <span className="register-kicker-dot" /> AxelPath ACADEMY
            </div>
            <h1>
              Secure your seat.
              <span> Register for a Course.</span>
            </h1>
            <p>
              Complete your course registration through a secure Razorpay checkout.
              Select your learning path, read and accept the agreement, then pay.
            </p>
            <div className="register-hero-points">
              <span><Check size={15} /> Agreement-protected</span>
              <span><Check size={15} /> Verified payment</span>
              <span><Check size={15} /> Email confirmation</span>
            </div>
          </div>

          <div className="register-brand-card">
            <div className="brand-card-glow" />
            <img src="/logo/AxelPath-logo-premium.png" alt="AxelPath" />
            <div className="brand-card-divider" />
            <div className="brand-card-status"><span /> Registration portal online</div>
            <div className="brand-card-program">
              <small>AxelPath ACADEMY</small>
              <strong>Choose your learning path</strong>
              <span>Secure registration • Mentor-led programs</span>
            </div>
          </div>
        </section>

        {/* ── Step indicators ───────────────────────────────────────── */}
        <section className="register-steps" aria-label="Registration steps">
          {STEPS.map((step, i) => (
            <>
              <div key={step.num} className={`register-step ${i <= currentStep ? "active" : ""}`}>
                <span>{i < currentStep ? "✓" : step.num}</span>
                <div>
                  <strong>{step.label}</strong>
                  <small>{step.sub}</small>
                </div>
              </div>
              {i < STEPS.length - 1 && <div key={`line-${i}`} className="register-step-line" />}
            </>
          ))}
        </section>

        {/* ── Main registration form ────────────────────────────────── */}
        <section className="registration-layout">
          <form className="registration-card" onSubmit={openAgreement}>
            <div className="registration-card-top">
              <div>
                <span className="summary-label">REGISTRATION DETAILS</span>
                <h2>Join the next learning cohort</h2>
                <p>Use the same details you want on your AxelPath registration record.</p>
              </div>
              <div className="secure-pill"><LockKeyhole size={14} /> Secure</div>
            </div>

            <div className="registration-fields">
              <label>
                <span>Full Name <b>*</b></span>
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={update}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  disabled={!!registrationId}
                />
              </label>
              <label>
                <span>Email Address <b>*</b></span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={update}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={!!registrationId}
                />
              </label>
              <label>
                <span>Phone Number <b>*</b></span>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={update}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  disabled={!!registrationId}
                />
              </label>
              <label>
                <span>Referral ID <em>Optional</em></span>
                <input
                  name="referral_id"
                  value={form.referral_id}
                  onChange={update}
                  placeholder="Enter referral ID"
                  disabled={!!registrationId}
                />
              </label>
              <label className="full-field course-select-field">
                <span>Select Your Course <b>*</b></span>
                <div className="select-wrap">
                  <select
                    name="course_slug"
                    value={form.course_slug}
                    onChange={update}
                    disabled={!!registrationId}
                  >
                    {courses.map((course) => (
                      <option key={course.slug} value={course.slug}>{course.title}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} />
                </div>
              </label>
            </div>

            {/* ── Agreement gate ──────────────────────────────────── */}
            {!agreementAccepted ? (
              <button
                className="register-pay-button"
                type="submit"
                disabled={loading}
                id="rc-view-agreement-btn"
              >
                <FileText size={19} />
                {loading ? "Preparing…" : "View Terms & Agreement"}
                {!loading && <ArrowRight size={17} />}
              </button>
            ) : (
              <div className="register-agreement-accepted">
                <CheckCircle2 size={18} />
                Agreement accepted — proceed to payment below
              </div>
            )}

            <div className="payment-note">
              <ShieldCheck size={16} />
              You must read and accept the AxelPath agreement before payment is unlocked.
            </div>
            {message && <div className="register-message">{message}</div>}
            {error && <div className="register-error">{error}</div>}
          </form>

          <aside className="registration-summary">
            <div className="summary-topline">
              <span className="summary-label">YOUR SELECTED PROGRAM</span>
              <span className="summary-badge">Selected</span>
            </div>
            <div className="summary-image">
              <img src={selectedCourse.image} alt={`${selectedCourse.title} course`} />
            </div>
            <div className="summary-category">{selectedCourse.category}</div>
            <h2>{selectedCourse.title}</h2>
            <p>{selectedCourse.description}</p>
            <div className="summary-row"><span>Level</span><strong>{selectedCourse.level}</strong></div>
            <div className="summary-secure">
              <ShieldCheck size={18} />
              <div>
                <strong>Agreement-protected payment</strong>
                <span>Payment requires agreement acceptance and is validated by the AxelPath server.</span>
              </div>
            </div>
          </aside>
        </section>

        {/* ── Payment section — unlocked only after agreement ────────── */}
        {agreementAccepted && !payment?.paid && !success && (
          <section className="utr-card">
            <div className="utr-icon"><ShieldCheck size={25} /></div>
            <div className="utr-copy">
              <span className="summary-label">03 · PAYMENT</span>
              <h2>Complete your enrollment</h2>
              <p>
                Your agreement has been accepted and recorded.
                Click below to open the secure Razorpay checkout.
                The payment amount will be displayed inside Razorpay.
              </p>
            </div>
            <button
              className="register-pay-button"
              onClick={openRazorpay}
              disabled={loading}
              id="rc-pay-btn"
            >
              <CreditCard size={19} />
              {loading ? "Opening secure checkout…" : "Pay with Razorpay"}
              {!loading && <ArrowRight size={17} />}
            </button>
            {error && <div className="register-error" style={{ marginTop: 12 }}>{error}</div>}
          </section>
        )}

        {/* ── UTR verification ──────────────────────────────────────── */}
        {payment?.paid && !success && (
          <section className="utr-card">
            <div className="utr-icon"><CheckCircle2 size={25} /></div>
            <div className="utr-copy">
              <span className="summary-label">04 · PAYMENT RECEIVED</span>
              <h2>One last verification</h2>
              <p>
                Enter the UTR / UPI transaction reference from your payment app.
                The server checks the Razorpay payment, amount, and duplicate reference
                before confirming your seat.
              </p>
            </div>
            <form onSubmit={verifyPayment} className="utr-form">
              <input
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="Enter UTR / transaction reference"
                autoComplete="off"
              />
              <button className="register-pay-button" type="submit" disabled={loading}>
                {loading ? "Verifying…" : "Verify & Complete Registration"}
              </button>
            </form>
            {error && <div className="register-error">{error}</div>}
          </section>
        )}

        {/* ── Success ───────────────────────────────────────────────── */}
        {success && (
          <section className="registration-success">
            <div className="success-top">
              <div className="success-check"><CheckCircle2 size={40} /></div>
              <div>
                <span className="summary-label">VERIFIED</span>
                <h2>You're officially enrolled.</h2>
                <p>
                  Payment successful. Your AXELPATH enrollment has been confirmed.
                  A confirmation email has been sent to your registered address.
                </p>
              </div>
            </div>
            <div className="success-grid">
              <div><span>Registration ID</span><strong>{success.registration_id}</strong></div>
              <div><span>Program</span><strong>{success.course_title}</strong></div>
              <div><span>Payment</span><strong className="paid-text">✓ Paid & verified</strong></div>
              <div><span>Agreement</span><strong className="paid-text">✓ Accepted & recorded</strong></div>
            </div>
            <div className="success-email">
              <Mail size={19} />
              {success.email_sent
                ? <><span>Confirmation sent to </span><strong>{form.email}</strong>.</>
                : <>Registration confirmed. Email delivery pending SMTP configuration for <strong>{form.email}</strong>.</>
              }
            </div>
          </section>
        )}

        {/* ── Trust copy ────────────────────────────────────────────── */}
        <section className="registration-trust-copy">
          <div className="trust-icon"><FileCheck2 size={22} /></div>
          <div>
            <h3>Registration you can trust.</h3>
            <p>
              AxelPath requires agreement acceptance before payment. Payment is confirmed
              only after the backend validates the Razorpay order, cryptographic payment
              signature, captured status, and transaction reference. A unique registration
              ID is issued and a confirmation email is sent.
            </p>
          </div>
        </section>
      </Container>
    </main>
  );
}
