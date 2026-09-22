import { MotionConfig } from "framer-motion";
import { AppUpdateNotice } from "./components/AppUpdateNotice";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { router } from "./routes";

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <RouterProvider router={router} />
        <AppUpdateNotice />
      </AuthProvider>
    </MotionConfig>
  );
}
