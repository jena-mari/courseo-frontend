import { LoadingIndicator } from "./LoadingIndicator";
import imgBg from "../assets/courseo-bg.png";
import imgLogo from "../assets/courseo-logo.png";

export function LoadingScreen({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="courseo-loading-enter relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#f4f6ff] px-6 font-['Montserrat',sans-serif] text-[#000181]" aria-busy="true">
      <img src={imgBg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-white/60" />
      <div className="relative flex w-full max-w-sm flex-col items-center py-10 text-center" role="status" aria-live="polite" aria-atomic="true">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/65 shadow-[0_8px_40px_rgba(0,1,129,0.06)]">
          <LoadingIndicator size={88} className="absolute" />
          <img src={imgLogo} alt="" className="h-9 w-9 object-contain" />
        </div>
        <h1 className="mt-6 text-[22px] font-black tracking-[-0.6px]">{title}</h1>
        <p className="mt-2 max-w-xs text-[12px] font-semibold leading-relaxed text-[#000181]/60">{detail}</p>
      </div>
    </div>
  );
}
