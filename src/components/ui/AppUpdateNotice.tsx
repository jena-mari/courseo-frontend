import { useEffect, useState } from "react";

/** Open tabs retain their original JavaScript until the user reloads. */
export function AppUpdateNotice() {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    if (import.meta.env.DEV) return;
    const controller = new AbortController();
    let checking = false;
    const check = async () => {
      if (document.visibilityState !== "visible" || checking) return;
      checking = true;
      try {
        const response = await fetch(`/version.json?check=${Date.now()}`, {
          cache: "no-store", signal: controller.signal,
        });
        if (!response.ok) return;
        const version = await response.json();
        if (!controller.signal.aborted && typeof version.revision === "string" && /^[a-f0-9]{40}$/.test(version.revision)) {
          setAvailable(version.revision !== __COURSEO_REVISION__);
        }
      } catch {
        // Offline browsers and older deployments can keep using the current app.
      } finally {
        checking = false;
      }
    };
    void check();
    const interval = window.setInterval(() => void check(), 60_000);
    document.addEventListener("visibilitychange", check);
    return () => {
      controller.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  if (!available) return null;
  return (
    <div role="status" className="fixed bottom-4 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 items-center gap-4 rounded-2xl bg-[#000181] p-4 font-['Montserrat',sans-serif] text-white shadow-xl">
      <p className="flex-1 text-xs font-semibold">A new version of Courseo is ready. Finish your message or save your changes, then reload.</p>
      <button type="button" onClick={() => window.location.reload()} className="rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-[#000181]">Reload</button>
    </div>
  );
}
