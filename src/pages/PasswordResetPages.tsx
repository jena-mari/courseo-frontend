import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, LoaderCircle, Lock, Mail } from "lucide-react";
import imgBg from "../assets/courseo-bg.png";
import imgLogo from "../assets/courseo-logo.png";
import { requestPasswordReset, resetPassword } from "../lib/authApi";

function ResetShell({ children }: { children: ReactNode }) {
  return <div className="relative h-[100dvh] w-full overflow-y-auto px-4 py-6 font-['Montserrat',sans-serif]"><img src={imgBg} className="fixed inset-0 h-full w-full object-cover" alt="" aria-hidden="true" /><div className="fixed inset-0 bg-[#050515]/65 backdrop-blur-[3px]" /><main className="relative z-10 mx-auto w-full max-w-[560px] rounded-[30px] bg-white px-6 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:px-12 sm:py-10">{children}</main></div>;
}

function Field({ label, type = "text", value, onChange, children }: { label: string; type?: string; value: string; onChange: (value: string) => void; children?: ReactNode }) {
  return <label className="block text-[13px] font-extrabold text-[#000181]">{label}<div className="mt-2 flex h-[52px] items-center gap-3 rounded-[17px] border-2 border-[rgba(0,1,129,0.25)] px-4 focus-within:border-[#000181]"><input required type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={type === "email" ? "email" : "new-password"} className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-[#000181] outline-none" />{children}</div></label>;
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => { event.preventDefault(); setLoading(true); setError(""); try { await requestPasswordReset(email.trim()); setSent(true); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not request a password reset."); } finally { setLoading(false); } };
  return <ResetShell><div className="flex items-center justify-between"><img src={imgLogo} alt="Courseo" className="h-10 w-10" /><Link to="/login" className="flex items-center gap-1 text-[12px] font-extrabold text-[#000181]"><ArrowLeft size={14} /> Back to login</Link></div>{sent ? <div className="py-12 text-center"><CheckCircle2 className="mx-auto text-emerald-600" size={48} /><h1 className="mt-5 text-[32px] font-black tracking-tight text-[#000181]">Check your email</h1><p className="mx-auto mt-3 max-w-sm text-[13px] font-semibold leading-relaxed text-[rgba(0,1,129,0.6)]">If an account exists for <strong>{email.trim()}</strong>, Courseo has sent a password reset link. The link expires in 60 minutes.</p><button onClick={() => setSent(false)} className="mt-6 text-[12px] font-extrabold text-[#000181] underline">Use a different email</button></div> : <><div className="mt-9 text-center"><h1 className="text-[36px] font-black tracking-tight text-[#000181]">Forgot your password?</h1><p className="mt-3 text-[13px] font-semibold leading-relaxed text-[rgba(0,1,129,0.6)]">Enter your account email and we'll send you a secure reset link.</p></div><form onSubmit={(event) => void submit(event)} className="mt-8"><Field label="Email address" type="email" value={email} onChange={setEmail}><Mail size={17} className="text-[rgba(0,1,129,0.45)]" /></Field>{error && <p role="alert" className="mt-3 text-center text-[12px] font-semibold text-red-600">{error}</p>}<button disabled={loading} className="mt-5 flex h-[54px] w-full items-center justify-center gap-2 rounded-[17px] bg-[#000181] text-[13px] font-extrabold text-white disabled:opacity-60">{loading && <LoaderCircle size={17} className="animate-spin" />}{loading ? "Sending reset link…" : "Send reset link"}</button></form></>}</ResetShell>;
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
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(""); if (!token) return setError("This reset link is missing its security token. Request a new link."); if (password.length < 8) return setError("Password must be at least 8 characters."); if (password !== confirm) return setError("Passwords do not match."); setLoading(true); try { await resetPassword(token, password); setPassword(""); setConfirm(""); setComplete(true); } catch (cause) { setError(cause instanceof Error ? cause.message : "This reset link is invalid or expired."); } finally { setLoading(false); } };
  return <ResetShell><img src={imgLogo} alt="Courseo" className="h-10 w-10" />{complete ? <div className="py-12 text-center"><CheckCircle2 className="mx-auto text-emerald-600" size={48} /><h1 className="mt-5 text-[32px] font-black tracking-tight text-[#000181]">Password updated</h1><p className="mt-3 text-[13px] font-semibold text-[rgba(0,1,129,0.6)]">Your new password is ready to use.</p><button onClick={() => navigate("/login")} className="mt-7 h-[52px] w-full rounded-[17px] bg-[#000181] text-[13px] font-extrabold text-white">Continue to login</button></div> : <><div className="mt-8 text-center"><h1 className="text-[36px] font-black tracking-tight text-[#000181]">Create a new password</h1><p className="mt-3 text-[13px] font-semibold text-[rgba(0,1,129,0.6)]">Choose a secure password with at least eight characters.</p></div><form onSubmit={(event) => void submit(event)} className="mt-8 space-y-4"><Field label="New password" type={show ? "text" : "password"} value={password} onChange={setPassword}><button type="button" onClick={() => setShow((value) => !value)} aria-label={show ? "Hide password" : "Show password"} className="text-[rgba(0,1,129,0.5)]">{show ? <Eye size={17} /> : <EyeOff size={17} />}</button></Field><Field label="Confirm new password" type={show ? "text" : "password"} value={confirm} onChange={setConfirm}><Lock size={17} className="text-[rgba(0,1,129,0.45)]" /></Field>{error && <p role="alert" className="text-center text-[12px] font-semibold text-red-600">{error}</p>}<button disabled={loading} className="flex h-[54px] w-full items-center justify-center gap-2 rounded-[17px] bg-[#000181] text-[13px] font-extrabold text-white disabled:opacity-60">{loading && <LoaderCircle size={17} className="animate-spin" />}{loading ? "Updating password…" : "Reset password"}</button></form></>}</ResetShell>;
}
