import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./i18n/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import { FarmProvider } from "./context/FarmContext";
import { RobotProvider } from "./context/RobotContext";
import { TaskProvider } from "./context/TaskContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ActivityLogProvider } from "./context/ActivityLogContext";
import AdminLogin from "./admin/pages/AdminLogin";
import AdminRoutes from "./routes/AdminRoutes";
import UserRoutes from "./routes/UserRoutes";
import ProtectedRoute from "./routes/ProtectedRoute";

// The data providers load from a staff-only API, so they are keyed on the
// session: signing in or out remounts them, and no data from the previous
// session survives into the next one.
function SessionScope() {
  const { isAuthenticated } = useAuth();
  return (
    <UserProvider key={isAuthenticated ? 'signed-in' : 'signed-out'}>
      <FarmProvider>
        <RobotProvider>
          <TaskProvider>
            <NotificationProvider>
              <ActivityLogProvider>
                <Routes>
                  <Route path="/" element={<AdminLogin />} />
                  <Route path="/login" element={<AdminLogin />} />
                  <Route path="/user/*" element={<UserRoutes />} />
                  <Route path="/admin/*" element={<ProtectedRoute><AdminRoutes /></ProtectedRoute>} />
                </Routes>
              </ActivityLogProvider>
            </NotificationProvider>
          </TaskProvider>
        </RobotProvider>
      </FarmProvider>
    </UserProvider>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <SessionScope />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
