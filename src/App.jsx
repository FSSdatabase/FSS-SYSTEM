/**
 * UPDATED App.jsx — WITH LOGIN SESSION + PERSISTENT AUTH
 *
 * Changes from previous version:
 *   1. user state now reads from localStorage on load (survives refresh/pull-down)
 *   2. Login saves user to localStorage
 *   3. Logout clears localStorage
 */
import { useState } from "react";
import Layout    from "./components/Layout";
import Login     from "./components/Login";
import Dashboard  from "./pages/Dashboard";
import Students   from "./pages/Students";
import Attendance from "./pages/Attendance";
import DAAR       from "./pages/DAAR";
import Fees       from "./pages/Fees";
import Academics  from "./pages/Academics";
import Reports    from "./pages/Reports";
import Timetable  from "./pages/Timetable";
import Manage     from "./pages/Manage";
import PlacementPromotion from "./pages/placementpromotion/placementpromotion";

export default function App() {
  const [page, setPage] = useState("dashboard");

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("fss_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // ── Not logged in: show login screen only ──────────────────────
  if (!user) {
    return (
      <Login onLogin={(loggedInUser) => {
        setUser(loggedInUser);
        localStorage.setItem("fss_user", JSON.stringify(loggedInUser));
      }} />
    );
  }

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("fss_user");
    setPage("dashboard");
  };

  const pages = {
    dashboard:  <Dashboard  setPage={setPage} user={user} />,
    students:   <Students   />,
    attendance: <Attendance />,
    daar:       <DAAR       user={user} />,
    fees:       <Fees       />,
    academics:  <Academics  />,
    reports:    <Reports    />,
    timetable:  <Timetable  />,
    manage:     <Manage     />,
    placementpromotion: <PlacementPromotion />,
  };

  return (
    <Layout page={page} setPage={setPage} user={user} onLogout={handleLogout}>
      {pages[page] || pages.dashboard}
    </Layout>
  );
}
