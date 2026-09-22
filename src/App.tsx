import { AppUpdateNotice } from "./components/AppUpdateNotice";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { router } from "./routes";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <AppUpdateNotice />
    </AuthProvider>
  );
}
