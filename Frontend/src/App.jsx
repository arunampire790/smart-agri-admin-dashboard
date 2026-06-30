import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import { FarmProvider } from "./context/FarmContext";
import { RobotProvider } from "./context/RobotContext";
import { TaskProvider } from "./context/TaskContext";
import { ActivityLogProvider } from "./context/ActivityLogContext";
import AdminLogin from "./admin/pages/AdminLogin";
import AdminRoutes from "./routes/AdminRoutes";
import UserRoutes from "./routes/UserRoutes";

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <FarmProvider>
          <RobotProvider>
            <TaskProvider>
              <ActivityLogProvider>
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<AdminLogin />} />
                    <Route path="/login" element={<AdminLogin />} />
                    <Route path="/user/*" element={<UserRoutes />} />
                    <Route path="/admin/*" element={<AdminRoutes />} />
                  </Routes>
                </BrowserRouter>
              </ActivityLogProvider>
            </TaskProvider>
          </RobotProvider>
        </FarmProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
