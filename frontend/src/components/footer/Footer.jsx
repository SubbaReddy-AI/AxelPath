import FooterLinks from "./FooterLinks";
import FooterServices from "./FooterServices";
import FooterAcademy from "./FooterAcademy";
import FooterBottom from "./FooterBottom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-glow" />

      <div className="footer-main">
        <div className="footer-brand">
          <img
            src="/logo/AxelPath-logo.png"
            alt="AxelPath"
          />

        </div>

        <FooterLinks />

        <FooterServices />

        <FooterAcademy />
      </div>

      <FooterBottom />
    </footer>
  );
}

export default Footer;