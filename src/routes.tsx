import { useEffect } from "react";
import { createBrowserRouter } from "react-router-dom";
import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GuestRoute, ProtectedRoute } from "./auth/RouteGuards";

function AnimatedRouteOutlet() {
  const location = useLocation();
  const outlet = useOutlet();
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? { duration: 0.01 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -7, filter: "blur(3px)" }}
        transition={transition}
        className="h-full w-full"
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}

export const router = createBrowserRouter([{
  element: <AnimatedRouteOutlet />,
  hydrateFallbackElement: <div className="h-[100dvh] w-full bg-[#f7f8ff]" role="status" aria-label="Loading Courseo" />,
  children: [
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
          lazy: async () => ({ Component: (await import("./pages/RegisterPage")).RegisterPage }),
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
  ],
}]);
