import { LoadingScreen } from "./components/LoadingScreen";
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

  // Opacity keeps viewport-fixed dialogs independent of the page height.
  // A transform or even blur(0px) would create a containing block for them.
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: reduceMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: reduceMotion ? 1 : 0 }}
        transition={transition}
        className="min-h-[100dvh] w-full min-w-0"
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}

export const router = createBrowserRouter([{
  element: <AnimatedRouteOutlet />,
  hydrateFallbackElement: <LoadingScreen title="Opening Courseo" detail="Loading your workspace…" />,
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
