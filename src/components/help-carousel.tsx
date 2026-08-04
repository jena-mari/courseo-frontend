import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, HelpCircle, X } from "lucide-react";
import slider1 from "../assets/slider1.png";
import slider2 from "../assets/slider2.png";
import slider3 from "../assets/slider3.png";

const SLIDES = [
  {
    image: slider1,
    alt: "SOLS navigation showing the Enrolment Record option",
    text: "Log into SOLS and navigate to Enrolment Record.",
  },
  {
    image: slider2,
    alt: "SOLS enrolment record table ready to be copied",
    text: "Copy your enrolment record through to the end of the table.",
  },
  {
    image: slider3,
    alt: "Courseo enrolment-record input containing copied study data",
    text: "Paste the copied record into Courseo to generate your study plan.",
  },
] as const;

export function HelpSlider({ onClose }: { onClose: () => void }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = SLIDES[activeSlide];
  const move = (direction: number) => {
    setActiveSlide((current) =>
      (current + direction + SLIDES.length) % SLIDES.length
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        initial={{ scale: 0.92, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="relative max-h-[calc(100dvh-32px)] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-xl sm:rounded-[32px] sm:p-8"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full text-[#000181] transition-colors hover:bg-[#f1f3ff]"
          aria-label="Close help"
        >
          <X size={20} />
        </button>

        <div className="mb-5 flex items-center gap-3 pr-12">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(131,231,255,0.5)]">
            <HelpCircle size={20} className="text-[#000181]" />
          </div>
          <h2 id="help-title" className="text-2xl font-extrabold tracking-tight text-[#000181]">
            How to use Courseo
          </h2>
        </div>

        <div className="overflow-hidden rounded-[20px] border border-[rgba(0,1,129,0.14)] bg-[#f8fbff]">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex min-h-[350px] flex-col items-center justify-center p-4 sm:p-6"
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="h-auto max-h-[250px] w-full object-contain"
            />
            <p className="mt-5 text-center text-[14px] font-semibold text-[#000181]">
              {slide.text}
            </p>
          </motion.div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => move(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(0,1,129,0.2)] text-[#000181] hover:bg-[#f1f3ff]"
            aria-label="Previous help step"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-2" aria-label={`Step ${activeSlide + 1} of ${SLIDES.length}`}>
            {SLIDES.map((item, index) => (
              <button
                key={item.image}
                type="button"
                onClick={() => setActiveSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeSlide ? "w-7 bg-[#000181]" : "w-2.5 bg-[rgba(0,1,129,0.22)]"
                }`}
                aria-label={`Show help step ${index + 1}`}
                aria-current={index === activeSlide ? "step" : undefined}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => move(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(0,1,129,0.2)] text-[#000181] hover:bg-[#f1f3ff]"
            aria-label="Next help step"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
