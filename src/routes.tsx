import { createBrowserRouter } from "react-router-dom";
import { StartPage } from "./pages/StartPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ChatPage } from "./pages/ChatPage";
import { SettingsPage } from "./pages/Settings";

export const router = createBrowserRouter([
  { path: "/", Component: StartPage },
  { path: "/login", Component: LoginPage },
  { path: "/register", Component: RegisterPage },
  { path: "/chat", Component: ChatPage },
  { path: "/settings", Component: SettingsPage },
]);
