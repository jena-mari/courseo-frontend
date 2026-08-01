import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/",
    lazy: async () => ({ Component: (await import("./pages/StartPage")).StartPage }),
  },
  {
    path: "/login",
    lazy: async () => ({ Component: (await import("./pages/LoginPage")).LoginPage }),
  },
  {
    path: "/register",
    lazy: async () => ({ Component: (await import("./pages/RegisterPage")).RegisterPage }),
  },
  {
    path: "/chat",
    lazy: async () => ({ Component: (await import("./pages/ChatPage")).ChatPage }),
  },
  {
    path: "/settings",
    lazy: async () => ({ Component: (await import("./pages/Settings")).SettingsPage }),
  },
]);
