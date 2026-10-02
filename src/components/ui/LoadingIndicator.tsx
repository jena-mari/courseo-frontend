import type { SVGProps } from "react";

/** Continuous visual activity only; never implies a percentage or backend stage. */
export function LoadingIndicator({ size = 18, className = "", ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg {...props} width={size} height={size} viewBox="0 0 48 48" fill="none" className={`courseo-loading-ring shrink-0 ${className}`} aria-hidden="true">
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeOpacity="0.12" strokeWidth="3" />
      <circle className="courseo-loading-orbit" cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="32 94" />
    </svg>
  );
}
