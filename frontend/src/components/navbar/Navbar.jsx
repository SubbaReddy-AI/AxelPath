import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import "./Navbar.css";

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="qk-navbar">
      <div className="qk-navbar-container">
        <Link to="/" className="qk-navbar-logo" aria-label="AxelPath Home"><img src="/logo/AxelPath-logo-premium.png" alt="AxelPath" /></Link>
        <NavLinks />
        <div className="qk-navbar-action"><Link to="/register-course" className="btn btn-primary">Register for a Course <span>→</span></Link></div>
        <button className="qk-mobile-toggle" type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(v => !v)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
      </div>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
export default Navbar;
