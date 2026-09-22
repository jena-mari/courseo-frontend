import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import imgBg from "../assets/courseo-bg.png";
import imgLogo from "../assets/courseo-logo.png";
import { requestPasswordReset, resetPassword } from "../lib/authApi";

function ResetShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#f7f7ff] font-['Montserrat',sans-serif] text-[#000181]">
      <img
        src={imgBg}
        className="fixed inset-0 h-full w-full object-cover object-center"
        alt=""
        aria-hidden="true"
      />
      <div className="fixed inset-0 bg-white/10" aria-hidden="true" />

      <header className="relative z-10 mx-auto flex w-full max-w-[1080px] items-center px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
        <Link to="/" className="group inline-flex items-center gap-3" aria-label="Courseo home">
          <img
            src={imgLogo}
            alt=""
            className="h-11 w-11 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105"
          />
          <span>
            <span className="block text-[20px] font-black leading-none tracking-[-0.04em]">Courseo</span>
            <span className="mt-1 block text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#5556bd]">
              UOW study planning
            </span>
          </span>
        </Link>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100dvh-100px)] w-full max-w-[1080px] items-center gap-8 px-6 pb-10 sm:px-12 lg:grid-cols-[0.85fr_1.15fr] lg:px-16 lg:pb-16">
        <aside className="hidden min-h-[590px] flex-col justify-center lg:flex" aria-hidden="true">
          <img
            src={imgLogo}
            alt=""
            className="courseo-hero-icon ml-[8%] w-[min(29vw,390px)] select-none object-contain drop-shadow-[0_30px_42px_rgba(48,50,173,0.18)]"
          />
          <div className="mt-10 max-w-[420px]">
            <p className="text-[12px] font-black uppercase tracking-[0.25em] text-[#6566c5]">Courseo account recovery</p>
            <h2 className="mt-3 text-[44px] font-black leading-[1.02] tracking-[-0.055em] text-[#000181]">
              Get back to your study plan.
            </h2>
            <p className="mt-5 max-w-[380px] text-[14px] font-semibold leading-7 text-[#4d4e9a]">
              Securely restore access and continue planning your course from where you left off.
            </p>
          </div>
        </aside>

        <section className="mx-auto w-full max-w-[610px] rounded-[32px] border border-white/80 bg-white/75 p-6 shadow-[0_28px_80px_rgba(43,45,139,0.16)] backdrop-blur-2xl sm:p-10 lg:p-12">
          {children}
        </section>
      </main>
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
  icon: ReactNode;
  trailing?: ReactNode;
};

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  icon,
  trailing,
}: FieldProps) {
  return (
    <label htmlFor={id} className="block text-[13px] font-extrabold text-[#000181]">
      {label}
      <span className="mt-2.5 flex h-[58px] items-center gap-3 rounded-[18px] border border-[#bfc0ea] bg-white/70 px-4 shadow-[0_8px_22px_rgba(48,50,173,0.05)] transition focus-within:border-[#4244b3] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#7779db]/10">
        <span className="flex shrink-0 text-[#6264bc]">{icon}</span>
        <input
          id={id}
          required
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-[#000181] outline-none placeholder:text-[#8f90c3]"
        />
        {trailing}
      </span>
    </label>
  );
}

function BackToLogin() {
  return (
    <Link
      to="/login"
      className="inline-flex items-center gap-2 text-[12px] font-extrabold text-[#5556b5] transition hover:text-[#000181]"
    >
      <ArrowLeft size={15} />
      Back to login
    </Link>
  );
}

function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-[14px] border border-red-200 bg-red-50/90 px-4 py-3 text-[12px] font-bold leading-relaxed text-red-700"
    >
      {children}
    </p>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not request a password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResetShell>
      <BackToLogin />

      {sent ? (
        <div className="py-7 text-center sm:py-10" aria-live="polite">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={34} />
          </div>
          <p className="mt-7 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">Reset link sent</p>
          <h1 className="mt-3 text-[34px] font-black tracking-[-0.045em] text-[#000181] sm:text-[40px]">Check your email</h1>
          <p className="mx-auto mt-4 max-w-md text-[13px] font-semibold leading-6 text-[#55569c]">
            If an account exists for <strong className="text-[#000181]">{email.trim()}</strong>, Courseo has sent a password reset link. The link expires in 60 minutes.
          </p>
          <Link
            to="/login"
            className="mt-8 inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-[17px] bg-[#000181] px-5 text-[13px] font-extrabold text-white shadow-[0_14px_30px_rgba(0,1,129,0.18)] transition hover:-translate-y-0.5 hover:bg-[#171898]"
          >
            Return to login <ArrowRight size={16} />
          </Link>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setError("");
            }}
            className="mt-5 text-[12px] font-extrabold text-[#5556b5] underline decoration-[#aaaadd] underline-offset-4 transition hover:text-[#000181]"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <>
          <div className="mt-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#e7e8ff] text-[#000181]">
              <Mail size={23} />
            </div>
            <p className="mt-7 text-[11px] font-black uppercase tracking-[0.22em] text-[#6566c5]">Account recovery</p>
            <h1 className="mt-2 text-[36px] font-black leading-tight tracking-[-0.05em] text-[#000181] sm:text-[43px]">
              Forgot your password?
            </h1>
            <p className="mt-4 max-w-md text-[13px] font-semibold leading-6 text-[#55569c]">
              Enter the email linked to your Courseo account and we’ll send you a secure reset link.
            </p>
          </div>

          <form onSubmit={(event) => void submit(event)} className="mt-8 space-y-5">
            <Field
              id="recovery-email"
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              autoComplete="email"
              icon={<Mail size={18} />}
            />
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <button
              disabled={loading}
              className="flex h-[56px] w-full items-center justify-center gap-2 rounded-[18px] bg-[#000181] px-5 text-[13px] font-extrabold text-white shadow-[0_14px_30px_rgba(0,1,129,0.18)] transition hover:-translate-y-0.5 hover:bg-[#171898] disabled:translate-y-0 disabled:cursor-wait disabled:opacity-60"
            >
              {loading && <LoaderCircle size={18} className="animate-spin" />}
              {loading ? "Sending reset link…" : "Send reset link"}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="mt-7 flex items-start gap-3 border-t border-[#dadaf0] pt-6 text-[11px] font-semibold leading-5 text-[#6667a5]">
            <ShieldCheck className="mt-0.5 shrink-0 text-[#5556b5]" size={17} />
            For your privacy, Courseo sends the same confirmation whether or not the email is registered.
          </div>
        </>
      )}
    </ResetShell>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("This reset link is missing its security token. Request a new link.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setPassword("");
      setConfirm("");
      setComplete(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "This reset link is invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResetShell>
      <BackToLogin />

      {complete ? (
        <div className="py-7 text-center sm:py-10" aria-live="polite">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={34} />
          </div>
          <p className="mt-7 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">Password secured</p>
          <h1 className="mt-3 text-[34px] font-black tracking-[-0.045em] text-[#000181] sm:text-[40px]">Password updated</h1>
          <p className="mt-4 text-[13px] font-semibold leading-6 text-[#55569c]">Your new password is ready to use.</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-8 flex h-[54px] w-full items-center justify-center gap-2 rounded-[17px] bg-[#000181] px-5 text-[13px] font-extrabold text-white shadow-[0_14px_30px_rgba(0,1,129,0.18)] transition hover:-translate-y-0.5 hover:bg-[#171898]"
          >
            Continue to login <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <>
          <div className="mt-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#e7e8ff] text-[#000181]">
              <Lock size={23} />
            </div>
            <p className="mt-7 text-[11px] font-black uppercase tracking-[0.22em] text-[#6566c5]">Secure your account</p>
            <h1 className="mt-2 text-[36px] font-black leading-tight tracking-[-0.05em] text-[#000181] sm:text-[43px]">
              Create a new password
            </h1>
            <p className="mt-4 max-w-md text-[13px] font-semibold leading-6 text-[#55569c]">
              Choose a new password with at least eight characters.
            </p>
          </div>

          <form onSubmit={(event) => void submit(event)} className="mt-8 space-y-5">
            <Field
              id="new-password"
              label="New password"
              type={show ? "text" : "password"}
              value={password}
              onChange={setPassword}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              icon={<Lock size={18} />}
              trailing={
                <button
                  type="button"
                  onClick={() => setShow((value) => !value)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="shrink-0 rounded-lg p-1 text-[#6667ae] transition hover:bg-[#ececff] hover:text-[#000181]"
                >
                  {show ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              }
            />
            <Field
              id="confirm-password"
              label="Confirm new password"
              type={show ? "text" : "password"}
              value={confirm}
              onChange={setConfirm}
              placeholder="Enter it again"
              autoComplete="new-password"
              icon={<Lock size={18} />}
            />
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <button
              disabled={loading}
              className="flex h-[56px] w-full items-center justify-center gap-2 rounded-[18px] bg-[#000181] px-5 text-[13px] font-extrabold text-white shadow-[0_14px_30px_rgba(0,1,129,0.18)] transition hover:-translate-y-0.5 hover:bg-[#171898] disabled:translate-y-0 disabled:cursor-wait disabled:opacity-60"
            >
              {loading && <LoaderCircle size={18} className="animate-spin" />}
              {loading ? "Updating password…" : "Reset password"}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="mt-7 flex items-start gap-3 border-t border-[#dadaf0] pt-6 text-[11px] font-semibold leading-5 text-[#6667a5]">
            <ShieldCheck className="mt-0.5 shrink-0 text-[#5556b5]" size={17} />
            Your password is sent over an encrypted connection and is never displayed after submission.
          </div>
        </>
      )}
    </ResetShell>
  );
}
