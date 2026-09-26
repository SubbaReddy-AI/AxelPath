import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock3, Mail, MapPin, MessageSquare, Phone, Send, Sparkles } from "lucide-react";
import Container from "../components/common/Container";
import { sendContactMessage } from "../api/contactApi";

const initialForm = { name: "", email: "", company: "", service: "", message: "" };

const services = ["AI & Generative AI", "Web & Full-Stack Development", "Data & Analytics", "Cloud & DevOps", "Training & Career Programs", "Technology Consulting"];

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [sending, setSending] = useState(false);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSending(true);
    setStatus({ type: "", message: "" });
    try {
      await sendContactMessage(form);
      setForm(initialForm);
      setStatus({ type: "success", message: "Your enquiry has been sent successfully. Our team will review it and get back to you." });
    } catch (error) {
      setStatus({ type: "error", message: error?.message || "We could not send your enquiry. Please try again." });
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="contact-premium-page">
      <section className="contact-premium-hero">
        <Container>
          <motion.div className="contact-hero-content" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }}>
            <span className="section-eyebrow">CONTACT AxelPath</span>
            <h1>Let's make your next <span>move clearer.</span></h1>
            <p>Have a product idea, technology requirement, training need or career question? Send us the details and start a conversation with the AxelPath team.</p>
            <div className="contact-hero-pills"><span><MessageSquare size={15} /> Project discussions</span><span><Sparkles size={15} /> AI & technology</span><span><UsersIcon /> Learning & careers</span></div>
          </motion.div>
        </Container>
      </section>

      <section className="contact-main section">
        <Container>
          <div className="contact-main-grid">
            <aside className="contact-sidebar">
              <div className="contact-side-card contact-side-highlight"><span className="section-eyebrow">START HERE</span><h2>Tell us what you need.</h2><p>A few clear details are enough. We will route your enquiry to the right conversation.</p></div>
              <div className="contact-detail-list">
                <a href="mailto:axelpathofficial@gmail.com"><span><Mail size={18} /></span><div><small>Email</small><strong>axelpathofficial@gmail.com</strong></div></a>
                <a href="tel:+917013888297"><span><Phone size={18} /></span><div><small>Phone</small><strong>+91 70138 88297</strong></div></a>
                <div><span><MapPin size={18} /></span><div><small>Location</small><strong>Tirupathi, Andhra Pradesh, India</strong></div></div>
                <div><span><Clock3 size={18} /></span><div><small>Response</small><strong>We aim to respond within 1–2 business days.</strong></div></div>
              </div>
              <div className="contact-side-note"><CheckCircle2 size={18} /><span>Your details are used only to handle your enquiry and follow-up.</span></div>
            </aside>

            <motion.div className="contact-form-card" initial={{ opacity: 0, x: 25 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="contact-form-heading"><div><span className="section-eyebrow">SEND AN ENQUIRY</span><h2>What can we help you <span>build?</span></h2></div><div className="contact-send-icon"><Send size={20} /></div></div>
              <form onSubmit={submit} className="contact-premium-form">
                <div className="contact-field-grid">
                  <label><span>Your name *</span><input name="name" value={form.name} onChange={update} placeholder="Enter your name" required /></label>
                  <label><span>Email address *</span><input name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" required /></label>
                </div>
                <div className="contact-field-grid">
                  <label><span>Company / organization</span><input name="company" value={form.company} onChange={update} placeholder="Company name (optional)" /></label>
                  <label><span>What are you looking for? *</span><select name="service" value={form.service} onChange={update} required><option value="">Select an area</option>{services.map((service) => <option key={service} value={service}>{service}</option>)}</select></label>
                </div>
                <label><span>Tell us about it *</span><textarea name="message" value={form.message} onChange={update} rows="7" minLength="10" placeholder="What are you trying to build, solve or learn? Include any useful context, timeline or goals." required /></label>
                <div className="contact-submit-row"><p>We review every enquiry before responding.</p><button className="btn btn-primary" type="submit" disabled={sending}>{sending ? "Sending…" : "Send enquiry"}<ArrowRight size={17} /></button></div>
                {status.message && <div className={`contact-form-status ${status.type}`} role="status"><CheckCircle2 size={18} />{status.message}</div>}
              </form>
            </motion.div>
          </div>
        </Container>
      </section>

      <section className="contact-next section"><Container><div className="contact-next-grid"><div><span className="section-eyebrow">NOT SURE WHERE TO START?</span><h2>That is okay. <span>We can start with a conversation.</span></h2></div><div><p>Whether you have a rough idea, an existing product that needs improvement, or simply want to understand which technology path fits your goal, send the context you have.</p><a href="mailto:axelpathofficial@gmail.com" className="text-link">Email the team <ArrowRight size={17} /></a></div></div></Container></section>
    </main>
  );
}

function UsersIcon() { return <MessageSquare size={15} />; }
