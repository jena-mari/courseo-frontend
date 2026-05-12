import imgBg from '/Users/jenamaribathan/courseo-frontend/src/assets/courseo-bg.png'

interface BackgroundProps {
  children: React.ReactNode;
  darkOverlay?: boolean;
}

export function CourseoBackground({ children, darkOverlay = true }: BackgroundProps) {
  return (
    <div className="relative w-full min-h-screen overflow-hidden font-['Montserrat',sans-serif]">
      <img
        src={imgBg}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        alt=""
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      {darkOverlay && <div className="absolute inset-0 bg-black/20 pointer-events-none" />}
      <div className="relative z-10 w-full min-h-screen">
        {children}
      </div>
    </div>
  );
}