/**
 * AgreementModal.jsx
 *
 * Displays the complete AxelPath Student Training, Evaluation & Career Support
 * Agreement (Sections 1–26 only — Section 27 Company Information is NOT shown).
 *
 * One checkbox. One button. No per-section checkboxes.
 */

import { useEffect, useRef, useState } from "react";
import { FileText, Lock, ShieldCheck, X } from "lucide-react";
import { acceptAgreement, AGREEMENT_VERSION } from "../../api/agreementApi";
import "./AgreementModal.css";

// ─────────────────────────────────────────────────────────────────────────────
// Agreement sections — SOURCE: AxelPath Student Training, Evaluation & Career
// Support Agreement (v1). Section 27 Company Information is intentionally omitted.
// ─────────────────────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    num: 1,
    title: "PURPOSE OF THE AGREEMENT",
    content: (
      <>
        <p>
          This Agreement is entered into between <strong>AxelPath</strong> ("the Company",
          "we", "us") and the student ("the Student", "you") upon enrolment in any AxelPath
          training programme. It sets out the terms and conditions governing the Student's
          participation in the AxelPath programme, including training, evaluation, career support,
          and any related services.
        </p>
        <p>
          By accepting this Agreement, the Student confirms that they have read, understood, and
          agree to be bound by all the terms contained herein.
        </p>
      </>
    ),
  },
  {
    num: 2,
    title: "AXELPATH PROGRAM",
    content: (
      <>
        <p>
          AxelPath offers a structured training and career development programme designed to equip
          students with practical, industry-relevant skills in software engineering, artificial
          intelligence, cloud computing, data, and related technology disciplines.
        </p>
        <p>The programme includes, but is not limited to:</p>
        <ul>
          <li>Mentor-led live and recorded sessions</li>
          <li>Practical assignments, quizzes, and projects</li>
          <li>Industry-relevant evaluation and assessments</li>
          <li>Internal interview preparation and mock interviews</li>
          <li>Career support and guidance for eligible students</li>
          <li>Certificate of completion for qualifying students</li>
        </ul>
        <p>
          The specific modules, schedule, duration, and delivery format may vary by programme and
          will be communicated to the Student at the time of enrolment.
        </p>
      </>
    ),
  },
  {
    num: 3,
    title: "STUDENT RESPONSIBILITIES",
    content: (
      <>
        <p>The Student agrees to:</p>
        <ul>
          <li>Actively participate in all programme sessions, assignments, quizzes, and projects.</li>
          <li>Maintain the required levels of attendance as specified in this Agreement.</li>
          <li>Complete all assessments honestly and to the best of their ability.</li>
          <li>Respect mentors, fellow students, and AxelPath staff at all times.</li>
          <li>Comply with all AxelPath policies, guidelines, and code of conduct.</li>
          <li>Provide accurate personal and professional information throughout the programme.</li>
          <li>Promptly communicate any difficulties that may affect their participation.</li>
          <li>Take ownership of their own learning, growth, and career development.</li>
        </ul>
      </>
    ),
  },
  {
    num: 4,
    title: "PERFORMANCE & QUALIFICATION REQUIREMENTS",
    content: (
      <>
        <p>
          To remain in good standing and qualify for career support services, certificates, and
          internal or external interview opportunities, the Student must meet all of the following
          minimum performance requirements:
        </p>
        <ul>
          <li><strong>Attendance:</strong> Minimum <strong>80%</strong> attendance across all scheduled sessions.</li>
          <li><strong>Quizzes:</strong> Minimum <strong>80%</strong> average score across all quizzes.</li>
          <li><strong>Assignments:</strong> Minimum <strong>80%</strong> score across all assignments.</li>
          <li><strong>Projects:</strong> Minimum <strong>70%</strong> score on each project.</li>
        </ul>
        <p>
          AxelPath reserves the right to define, update, and communicate additional performance
          thresholds for each programme cohort.
        </p>
        <p>
          Failure to meet the required performance standards may result in the Student being
          deemed ineligible for career support, certificates, or further programme stages.
        </p>
      </>
    ),
  },
  {
    num: 5,
    title: "ATTENDANCE REQUIREMENT",
    content: (
      <>
        <p>
          Regular attendance is mandatory. The Student is required to attend a minimum percentage
          of all scheduled sessions as specified by AxelPath at the time of programme commencement.
        </p>
        <p>
          Failure to maintain the required attendance threshold may result in disqualification
          from evaluation, career support, or certification, at AxelPath's sole discretion.
        </p>
        <p>
          Where absences are unavoidable, the Student must notify AxelPath in advance and make
          reasonable efforts to cover the missed material through available recorded sessions or
          self-study resources.
        </p>
      </>
    ),
  },
  {
    num: 6,
    title: "QUIZ REQUIREMENT",
    content: (
      <>
        <p>
          Quizzes are a core component of programme evaluation. The Student is required to
          attempt all scheduled quizzes within the specified time windows.
        </p>
        <p>
          A minimum passing score will be communicated for each quiz. Failure to achieve the
          minimum required scores across all quizzes may affect the Student's eligibility for
          certificates, career support, or further programme stages.
        </p>
        <p>
          All quiz attempts must be the Student's own independent work. Academic dishonesty in
          any form will result in immediate disqualification.
        </p>
      </>
    ),
  },
  {
    num: 7,
    title: "ASSIGNMENT REQUIREMENT",
    content: (
      <>
        <p>
          Assignments are practical tasks designed to reinforce learning and build demonstrable
          skills. The Student is required to submit all assignments by the prescribed deadlines.
        </p>
        <p>
          Late submissions may be penalised or not accepted, as determined by AxelPath's programme
          guidelines. All assignments must reflect the Student's own work and effort.
        </p>
        <p>
          Plagiarism, copying, or using another person's work without attribution is strictly
          prohibited and will result in immediate disqualification from the programme.
        </p>
      </>
    ),
  },
  {
    num: 8,
    title: "PROJECT REQUIREMENT",
    content: (
      <>
        <p>
          Each programme includes one or more projects that require the Student to apply their
          learning to a real-world or simulated problem. Projects are a significant component
          of the overall evaluation and must be completed to a satisfactory standard.
        </p>
        <p>
          Projects must be the Student's original work. Group projects must reflect an equitable
          contribution from all team members.
        </p>
        <p>
          AxelPath may retain project submissions for portfolio, showcase, or assessment purposes,
          subject to the Student's prior consent.
        </p>
      </>
    ),
  },
  {
    num: 9,
    title: "AXELPATH INTERNAL INTERVIEW",
    content: (
      <>
        <p>
          Students who meet all performance, attendance, quiz, assignment, and project requirements
          may be invited to participate in an AxelPath Internal Interview.
        </p>
        <p>
          The Internal Interview is a structured evaluation conducted by AxelPath to assess the
          Student's technical knowledge, communication skills, problem-solving ability, and overall
          readiness for professional opportunities.
        </p>
        <p>
          Eligibility for the Internal Interview is determined solely by AxelPath and is contingent
          on satisfactory completion of all preceding programme requirements. Participation in the
          Internal Interview does not guarantee any external opportunity, placement, or employment.
        </p>
      </>
    ),
  },
  {
    num: 10,
    title: "EXTERNAL / REAL-COMPANY INTERVIEW PROCESS",
    content: (
      <>
        <p>
          Students who successfully clear the AxelPath Internal Interview may, at AxelPath's
          discretion and subject to availability, be referred to or considered for opportunities
          with external companies, organisations, or clients.
        </p>
        <p>
          External interview processes are conducted entirely by the respective third-party employer
          or organisation and are outside AxelPath's control. The Student acknowledges that
          AxelPath's role in the external process is limited to referral or recommendation, and
          AxelPath cannot guarantee any particular outcome.
        </p>
        <p>
          Selection decisions are made exclusively by the third-party employer and are not
          influenced or controlled by AxelPath.
        </p>
      </>
    ),
  },
  {
    num: 11,
    title: "CANDIDATE EFFORT & AXELPATH SUPPORT",
    content: (
      <>
        <p>
          The programme outcome is a shared responsibility between the Student and AxelPath. The
          effort contribution is understood as follows:
        </p>
        <ul>
          <li>
            <strong>70% — Candidate Effort:</strong> The Student is responsible for 70% of the
            outcome. This includes active participation, self-study, assignment completion, quiz
            performance, project quality, attendance, and overall personal commitment to the programme.
          </li>
          <li>
            <strong>30% — AXELPATH Support:</strong> AxelPath contributes 30% through high-quality
            training, mentorship, evaluation frameworks, career guidance, and access to resources
            and interview opportunities.
          </li>
        </ul>
        <p>
          AxelPath is committed to providing the Student with high-quality training, mentorship,
          evaluation, and guidance throughout the programme. AxelPath will make reasonable efforts
          to support the Student's development and career aspirations.
        </p>
        <p>
          However, the ultimate responsibility for the Student's success rests with the Student.
          AxelPath's support is conditional upon the Student demonstrating consistent effort,
          participation, and commitment as required by this Agreement.
        </p>
        <p>
          Students who do not meet the required effort standards may not qualify for advanced
          support, career guidance, or interview referrals.
        </p>
      </>
    ),
  },
  {
    num: 12,
    title: "NO GUARANTEE OF EMPLOYMENT OR PLACEMENT",
    content: (
      <>
        <p>
          <strong>
            AxelPath does not guarantee employment, job placement, internship placement, or any
            specific career outcome for any Student.
          </strong>
        </p>
        <p>
          The programme is designed to build skills and improve employability, but AxelPath makes
          no representation, warranty, or promise — express or implied — that the Student will
          secure employment, an internship, a project role, or any other opportunity upon
          completion of the programme.
        </p>
        <p>
          The Student enrols in the programme with a clear understanding that outcomes depend on
          many factors, including the Student's own skills, effort, performance, market conditions,
          and third-party decisions that are outside AxelPath's control.
        </p>
      </>
    ),
  },
  {
    num: 13,
    title: "MERIT-BASED AND OPPORTUNITY-BASED SELECTION",
    content: (
      <>
        <p>
          All career support activities, interview referrals, and placement recommendations are
          strictly merit-based and opportunity-based.
        </p>
        <p>
          Eligibility for referrals is determined by the Student's programme performance, internal
          interview results, conduct, and AxelPath's assessment of readiness. AxelPath does not
          guarantee a fixed number of referrals or opportunities for any Student.
        </p>
        <p>
          Opportunities are subject to availability and market conditions, which may vary and are
          beyond AxelPath's control.
        </p>
      </>
    ),
  },
  {
    num: 14,
    title: "THIRD-PARTY EMPLOYERS",
    content: (
      <>
        <p>
          Third-party employers, organisations, or clients who engage with students through
          AxelPath are independent entities. AxelPath does not represent, warrant, or guarantee
          the conduct, suitability, or decisions of third-party employers.
        </p>
        <p>
          The Student acknowledges that AxelPath acts solely as an intermediary in connecting
          students with external opportunities and bears no responsibility for any employment
          agreements, disputes, compensation arrangements, or outcomes arising from a Student's
          engagement with a third-party employer.
        </p>
      </>
    ),
  },
  {
    num: 15,
    title: "ASSESSMENT INTEGRITY",
    content: (
      <>
        <p>
          The Student agrees to maintain the highest standards of academic and professional
          integrity throughout the programme. Any form of cheating, plagiarism, impersonation,
          misrepresentation, or academic dishonesty is strictly prohibited.
        </p>
        <p>Violations include, but are not limited to:</p>
        <ul>
          <li>Submitting another person's work as one's own</li>
          <li>Using unauthorised materials during assessments</li>
          <li>Sharing assessment questions or answers with others</li>
          <li>Having another person complete any assessment on one's behalf</li>
          <li>Fabricating data, results, or project outcomes</li>
        </ul>
        <p>
          Violations of assessment integrity will result in immediate disqualification from the
          programme without refund, and may be reported where appropriate.
        </p>
      </>
    ),
  },
  {
    num: 16,
    title: "FEES AND PAYMENT",
    content: (
      <>
        <p>
          Programme fees are determined by AxelPath and communicated to the Student at the time
          of enrolment. All fees must be paid in full through the designated payment gateway
          before access to programme materials is granted.
        </p>
        <p>
          Fees are non-transferable and are personal to the enrolled Student. Fees cover the
          standard programme content and services as described at the time of enrolment.
        </p>
        <p>
          AxelPath reserves the right to revise fees for future cohorts. Fee changes will not
          affect Students who have already enrolled and paid for the current cohort.
        </p>
      </>
    ),
  },
  {
    num: 17,
    title: "REFUND AND CANCELLATION",
    content: (
      <>
        <p>
          AxelPath's refund and cancellation policy is as follows:
        </p>
        <ul>
          <li>
            <strong>Cancellation before programme commencement:</strong> A partial refund may be
            considered, subject to AxelPath's prevailing refund policy at the time of cancellation.
          </li>
          <li>
            <strong>Cancellation after programme commencement:</strong> No refund will be provided
            once the programme has commenced and the Student has accessed programme materials or
            attended sessions.
          </li>
          <li>
            <strong>Disqualification due to misconduct or integrity violation:</strong> No refund
            will be issued in any case of disqualification arising from a breach of this Agreement.
          </li>
        </ul>
        <p>
          Refund requests must be submitted in writing to AxelPath's official contact channel.
          AxelPath's decision on refund eligibility shall be final and binding.
        </p>
      </>
    ),
  },
  {
    num: 18,
    title: "CERTIFICATES",
    content: (
      <>
        <p>
          Upon successful completion of all programme requirements — including attendance, quizzes,
          assignments, projects, and any applicable internal assessments — the Student will be
          eligible to receive an AxelPath Certificate of Completion.
        </p>
        <p>
          Certificates will not be issued to Students who have not met all programme requirements,
          regardless of partial completion or fee payment.
        </p>
        <p>
          Certificates issued by AxelPath are programme-specific and reflect the Student's
          completion of the relevant training. They do not constitute a professional qualification,
          academic credential, or guarantee of employment.
        </p>
        <p>
          AxelPath reserves the right to revoke a certificate if it is subsequently found that
          the Student obtained it through misrepresentation or academic dishonesty.
        </p>
      </>
    ),
  },
  {
    num: 19,
    title: "STUDENT CONDUCT",
    content: (
      <>
        <p>
          The Student agrees to conduct themselves in a professional, respectful, and constructive
          manner throughout the programme. The following behaviours are strictly prohibited:
        </p>
        <ul>
          <li>Harassment, bullying, or intimidation of any kind</li>
          <li>Discriminatory language or behaviour</li>
          <li>Disruption of sessions or programme activities</li>
          <li>Sharing confidential programme content or materials without authorisation</li>
          <li>Any conduct that brings AxelPath into disrepute</li>
        </ul>
        <p>
          AxelPath reserves the right to take disciplinary action, including suspension or
          termination of enrolment, for any breach of conduct standards. No refund will be
          issued in such circumstances.
        </p>
      </>
    ),
  },
  {
    num: 20,
    title: "INTELLECTUAL PROPERTY",
    content: (
      <>
        <p>
          All training materials, content, assessments, recordings, frameworks, tools, and
          resources provided by AxelPath are the exclusive intellectual property of AxelPath
          and are protected by applicable intellectual property laws.
        </p>
        <p>
          The Student is granted a limited, non-exclusive, non-transferable licence to use
          programme materials solely for personal learning purposes during the programme.
        </p>
        <p>
          The Student must not reproduce, distribute, share, sell, or publicly disclose any
          AxelPath materials without prior written consent. Unauthorised use of AxelPath's
          intellectual property may result in legal action.
        </p>
        <p>
          Original work created by the Student during the programme remains the intellectual
          property of the Student, subject to any specific terms communicated for collaborative
          or sponsored projects.
        </p>
      </>
    ),
  },
  {
    num: 21,
    title: "PRIVACY AND PERSONAL INFORMATION",
    content: (
      <>
        <p>
          AxelPath collects and processes the Student's personal information solely for the
          purpose of administering the programme, providing career support services, issuing
          certificates, and communicating programme-related information.
        </p>
        <p>
          Personal information will not be sold, shared with unauthorised third parties, or
          used for purposes unrelated to the programme without the Student's consent, except
          where required by law.
        </p>
        <p>
          AxelPath may share relevant profile information (such as name, programme details,
          and performance summary) with prospective employers or partners as part of career
          support activities, with the Student's knowledge.
        </p>
        <p>
          The Student has the right to access, correct, or request deletion of their personal
          data by contacting AxelPath through official channels.
        </p>
      </>
    ),
  },
  {
    num: 22,
    title: "PROGRAM CHANGES",
    content: (
      <>
        <p>
          AxelPath reserves the right to modify the programme structure, content, schedule,
          delivery format, mentors, or any other aspect of the programme at any time, with
          reasonable notice to enrolled students.
        </p>
        <p>
          Changes will be made with the intent of improving programme quality and relevance.
          Material changes that significantly affect the Student's enrolment terms will be
          communicated in advance, and the Student will be given the opportunity to withdraw
          with a pro-rated refund if the changes are unacceptable.
        </p>
      </>
    ),
  },
  {
    num: 23,
    title: "SUSPENSION OR TERMINATION",
    content: (
      <>
        <p>
          AxelPath reserves the right to suspend or terminate a Student's enrolment for any
          of the following reasons:
        </p>
        <ul>
          <li>Breach of this Agreement</li>
          <li>Misconduct or violation of the code of conduct</li>
          <li>Academic dishonesty or assessment integrity violations</li>
          <li>Failure to make payment or payment disputes</li>
          <li>Any conduct deemed harmful to AxelPath, its staff, or other students</li>
        </ul>
        <p>
          In the event of suspension or termination, AxelPath will notify the Student in
          writing. No refund will be issued for termination arising from a breach of this
          Agreement by the Student.
        </p>
        <p>
          The Student may also voluntarily withdraw from the programme at any time, subject
          to the refund and cancellation terms set out in Section 17.
        </p>
      </>
    ),
  },
  {
    num: 24,
    title: "LIMITATION OF LIABILITY",
    content: (
      <>
        <p>
          To the maximum extent permitted by applicable law, AxelPath's total liability to
          the Student for any claim arising out of or in connection with this Agreement or
          the programme shall not exceed the total fees paid by the Student for the specific
          programme cohort in question.
        </p>
        <p>
          AxelPath shall not be liable for any indirect, consequential, incidental, special,
          or punitive damages, including but not limited to loss of income, loss of employment
          opportunity, loss of data, or reputational damage, arising from the Student's
          participation in or inability to complete the programme.
        </p>
        <p>
          AxelPath is not responsible for any outcomes resulting from the Student's interactions
          with third-party employers, organisations, or platforms encountered through the programme.
        </p>
      </>
    ),
  },
  {
    num: 25,
    title: "GOVERNING LAW",
    content: (
      <>
        <p>
          This Agreement shall be governed by and construed in accordance with the laws of India.
          Any disputes arising out of or in connection with this Agreement shall be subject to
          the exclusive jurisdiction of the courts located in India.
        </p>
        <p>
          The parties agree to attempt to resolve any dispute in good faith through direct
          communication before initiating formal legal proceedings.
        </p>
      </>
    ),
  },
  {
    num: 26,
    title: "STUDENT ACKNOWLEDGEMENT AND ACCEPTANCE",
    content: (
      <>
        <p>By accepting this Agreement, the Student acknowledges and confirms that:</p>
        <ul>
          <li>They have read this Agreement in full and understand all its terms.</li>
          <li>They agree to be bound by all terms and conditions set out herein.</li>
          <li>
            They understand that AxelPath does not guarantee employment, placement, or any
            specific career outcome.
          </li>
          <li>
            They understand that career support and interview referrals are merit-based and
            subject to availability.
          </li>
          <li>
            They accept that fees paid are non-refundable once the programme has commenced,
            except as specified in Section 17.
          </li>
          <li>
            They commit to maintaining the required standards of attendance, performance,
            and conduct throughout the programme.
          </li>
          <li>
            They understand that AxelPath may update programme content, schedule, or terms
            with reasonable notice.
          </li>
          <li>
            They consent to AxelPath processing and using their personal information as
            described in Section 21.
          </li>
        </ul>
        <p>
          This acceptance is electronically recorded and constitutes a legally binding agreement
          between the Student and AxelPath.
        </p>
      </>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function AgreementModal({ registrationId, onAccepted, onClose }) {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scrollPct, setScrollPct] = useState(0);
  const bodyRef = useRef(null);

  // Track scroll progress
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      setScrollPct(max > 0 ? Math.round((el.scrollTop / max) * 100) : 100);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Trap focus inside modal
  useEffect(() => {
    const prev = document.activeElement;
    return () => prev?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleAccept = async () => {
    if (!checked) return;
    setError("");
    setLoading(true);
    try {
      await acceptAgreement(registrationId);
      onAccepted();
    } catch (err) {
      setError(err.message || "Failed to save agreement acceptance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="ap-agreement-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ap-agreement-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="ap-agreement-modal">

        {/* ── Header ───────────────────────────────── */}
        <div className="ap-agreement-header">
          <div className="ap-agreement-header-left">
            <div className="ap-agreement-header-icon">
              <FileText size={18} />
            </div>
            <div>
              <h2 id="ap-agreement-title">
                Student Training, Evaluation &amp; Career Support Agreement
              </h2>
              <span className="ap-agreement-version-tag">
                {AGREEMENT_VERSION}
              </span>
            </div>
          </div>
          <button
            className="ap-agreement-close"
            onClick={onClose}
            aria-label="Close agreement"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scroll progress bar ───────────────────── */}
        <div className="ap-agreement-progress">
          <div className="ap-agreement-progress-bar">
            <div
              className="ap-agreement-progress-fill"
              style={{ width: `${scrollPct}%` }}
            />
          </div>
          <span className="ap-agreement-progress-label">
            {scrollPct < 100 ? `${scrollPct}% read` : "✓ Fully read"}
          </span>
        </div>

        {/* ── Document body ─────────────────────────── */}
        <div className="ap-agreement-body" ref={bodyRef}>
          <div className="ap-agreement-doc-title">
            <h1>
              AXELPATH STUDENT TRAINING, EVALUATION &amp;<br />
              CAREER SUPPORT AGREEMENT
            </h1>
            <p>Please read all 26 sections carefully before accepting.</p>
          </div>

          {SECTIONS.map((section) => (
            <div key={section.num} className="ap-agreement-section">
              <h3>
                <span className="ap-agreement-section-num">{section.num}</span>
                {section.title}
              </h3>
              {section.content}
            </div>
          ))}
        </div>

        {/* ── Acceptance footer ─────────────────────── */}
        <div className="ap-agreement-footer">
          <div className="ap-agreement-scroll-hint">
            <span>↓</span>
            Scroll up to read the full agreement before accepting
          </div>

          {/* ONE acceptance checkbox */}
          <div className={`ap-agreement-acceptance-box ${checked ? "is-checked" : ""}`}>
            <label className="ap-agreement-checkbox-label">
              <input
                type="checkbox"
                id="ap-agreement-checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                disabled={loading}
              />
              <span className="ap-agreement-checkbox-text">
                I have read, understood, and agree to the{" "}
                <strong>
                  AXELPATH Student Training, Evaluation &amp; Career Support Agreement
                </strong>
                .
              </span>
            </label>
          </div>

          {/* Accept & Continue — disabled until checkbox checked */}
          <button
            className={`ap-agreement-accept-btn ${loading ? "is-loading" : ""}`}
            onClick={handleAccept}
            disabled={!checked || loading}
            id="ap-agreement-accept-btn"
          >
            <ShieldCheck size={18} />
            {loading ? "Saving acceptance…" : "Accept & Continue to Payment"}
            {!loading && <Lock size={15} />}
          </button>

          {error && <div className="ap-agreement-error">{error}</div>}
        </div>
      </div>
    </div>
  );
}
