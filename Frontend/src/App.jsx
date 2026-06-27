import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { FarmProvider } from "./context/FarmContext";
import { RobotProvider } from "./context/RobotContext";
import { TaskProvider } from "./context/TaskContext";
import AdminLogin from "./admin/pages/AdminLogin";
import AdminRoutes from "./routes/AdminRoutes";
import UserRoutes from "./routes/UserRoutes";

function App() {
  return (
    <UserProvider>
      <FarmProvider>
        <RobotProvider>
        <TaskProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AdminLogin />} />
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/user/*" element={<UserRoutes />} />
            <Route path="/admin/*" element={<AdminRoutes />} />
          </Routes>
        </BrowserRouter>
        </TaskProvider>
        </RobotProvider>
      </FarmProvider>
    </UserProvider>
  );
}

export default App;
