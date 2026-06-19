import { useState } from "react";
import Layout    from "./components/Layout";
import Dashboard  from "./pages/Dashboard";
import Students   from "./pages/Students";
import Attendance from "./pages/Attendance";
import DAAR       from "./pages/DAAR";
import Fees       from "./pages/Fees";
import Academics  from "./pages/Academics";
import Reports    from "./pages/Reports";
import Timetable  from "./pages/Timetable";
import Manage     from "./pages/Manage";

export default function App() {
  const [page, setPage] = useState("dashboard");

  const pages = {
    dashboard:  <Dashboard  setPage={setPage} />,
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
    <Layout page={page} setPage={setPage}>
      {pages[page] || pages.dashboard}
    </Layout>
  );
}
