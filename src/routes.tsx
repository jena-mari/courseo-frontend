import { createBrowserRouter } from "react-router-dom";
import { GuestRoute, ProtectedRoute } from "./auth/RouteGuards";

export const router = createBrowserRouter([
  {
    path: "/",
    lazy: async () => ({ Component: (await import("./pages/StartPage")).StartPage }),
  },
  {
    path: "/forgot-password",
    lazy: async () => ({ Component: (await import("./pages/PasswordResetPages")).ForgotPasswordPage }),
  },
  {
    path: "/reset-password",
    lazy: async () => ({ Component: (await import("./pages/PasswordResetPages")).ResetPasswordPage }),
  },
  {
    element: <GuestRoute />,
    children: [
      {
        path: "/login",
        lazy: async () => ({ Component: (await import("./pages/LoginPage")).LoginPage }),
      },
      {
        path: "/register",
        lazy: async () => ({
          Component: (await import("./pages/RegisterPage")).RegisterPage,
        }),
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/profile",
        lazy: async () => ({ Component: (await import("./pages/ProfilePage")).ProfilePage }),
      },
      {
        path: "/connect-key",
        lazy: async () => ({ Component: (await import("./pages/ConnectKeyPage")).ConnectKeyPage }),
      },
      {
        path: "/chat",
        lazy: async () => ({ Component: (await import("./pages/ChatPage")).ChatPage }),
      },
      {
        path: "/settings",
        lazy: async () => ({ Component: (await import("./pages/Settings")).SettingsPage }),
      },
    ],
  },
]);
