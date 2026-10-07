import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../user/pages/Login";
import Onboarding from "../user/pages/Onboarding";

// There is no sign-up route: accounts exist only because an admin created one
// for a robot owner, so /register just sends people back to the login page.
//
// There is no pairing route either. A robot is paired by holding the farmer's
// QR up to its camera - the robot talks to /api/device/pair/ itself, and no
// browser is involved at any point.
function UserRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Navigate to="/user" replace />} />
      <Route path="/onboarding" element={<Onboarding />} />
    </Routes>
  );
}

export default UserRoutes;
