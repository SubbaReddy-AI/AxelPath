import { Link } from "react-router-dom";

function FooterBottom() {
  return (
    <div className="footer-bottom">
      <p>
        © {new Date().getFullYear()} AxelPath.
        All rights reserved.
      </p>

      <div>
        <Link to="/privacy-policy">
          Privacy Policy
        </Link>

        <Link to="/terms-conditions">
          Terms & Conditions
        </Link>
      </div>
    </div>
  );
}

export default FooterBottom;