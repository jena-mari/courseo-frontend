import { useState } from "react";
import { AccountManagement } from "./AccountManagementPopup";
import { LoginCard } from "../pages/LoginPage";
import { RegisterCard } from "../pages/RegisterPage";
import { getAuthSession } from "../lib/authSession";

type AccountMode = "login" | "register";

export function AccountAccessPopup({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<AccountMode>("login");

  if (getAuthSession()) {
    return <AccountManagement onClose={onClose} />;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div className="w-full max-w-[590px]" onClick={(event) => event.stopPropagation()}>
        {mode === "login" ? (
          <LoginCard onClose={onClose} onRegister={() => setMode("register")} />
        ) : (
          <RegisterCard onClose={onClose} onLogin={() => setMode("login")} />
        )}
      </div>
    </div>
  );
}
