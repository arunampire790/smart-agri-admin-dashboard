import { Routes, Route } from "react-router-dom";
import Login from "../user/pages/Login";
import Register from "../user/pages/Register";
import Onboarding from "../user/pages/Onboarding";

function UserRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboarding" element={<Onboarding />} />
    </Routes>
  );
}

export default UserRoutes;
