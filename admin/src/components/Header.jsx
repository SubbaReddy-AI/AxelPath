import { useContext } from "react";
import { Menu, LogOut } from "lucide-react";

import { AuthContext } from "../context/AuthContext";

export default function Header({
  title,
  subtitle,
  onMenuClick,
}) {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="admin-header">
      <div className="admin-header-title">
        <button
          type="button"
          className="admin-menu-button"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      <div className="admin-user-menu">
        <div className="admin-user-details">
          <strong>{user?.full_name || "Administrator"}</strong>
          <span>{user?.email || "admin@AxelPath.com"}</span>
        </div>

        <button
          type="button"
          className="admin-logout-button"
          onClick={logout}
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}