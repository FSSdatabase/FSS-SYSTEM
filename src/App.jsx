/**
* UPDATED App.jsx — WITH LOGIN SESSION
*
* This is your FULL App.jsx with the login wiring added.
* Compare against your current version and merge — or just
* replace the whole file, since the only additions are:
*   1. Login import + useState for `user`
*   2. A guard that shows <Login> until someone signs in
*   3. `user` and `onLogout` passed down to Layout
*
* Nothing about your existing page imports or the `pages` object changed.
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
  const [user, setUser] = useState(null);   // null = not logged in

  // ── Not logged in: show login screen only ──────────────────────
  if (!user) {
    return <Login onLogin={(loggedInUser) => setUser(loggedInUser)} />;
  }

  const handleLogout = () => {
    setUser(null);
    setPage("dashboard");
  };

  const pages = {
dashboard:  <Dashboard  setPage={setPage} user={user} />,
    students:   <Students   />,
    attendance: <Attendance />,
    daar:       <DAAR       />,
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
