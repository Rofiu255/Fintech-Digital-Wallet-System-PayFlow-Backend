import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar({ onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo">PF</div>
        <h3>PayFlow</h3>
      </div>

      <nav>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/dashboard#transfer">Transfer</Link>
        <Link to="/dashboard#transactions">Transactions</Link>
      </nav>

      <div className="sidebar-foot">
        <button className="btn-ghost" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
