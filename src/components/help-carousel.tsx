import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, ClipboardCheck, Copy, ExternalLink, HelpCircle, KeyRound, ListChecks, MessageCircle, X } from "lucide-react";
import { Copilot } from "@lobehub/icons";
import copilotStepOne from "../assets/instructions/01-copilot.gif";
import copilotStepTwo from "../assets/instructions/02-copilot.gif";
import copilotStepThree from "../assets/instructions/03-copilot.gif";
import courseoStepOne from "../assets/instructions/01-courseo.gif";
import courseoStepTwo from "../assets/instructions/02-courseo.gif";
import courseoStepThree from "../assets/instructions/03-courseo.gif";
import courseoStepFour from "../assets/instructions/04-courseo.gif";

type Pathway = "courseo" | "copilot";
type HelpStep = {
  icon: ReactNode;
  number: string;
  title: string;
  description: string;
  detail: string;
  media?: { src: string; alt: string };
  link?: { href: string; label: string };
};

const STEP_SETS: Record<Pathway, HelpStep[]> = {
  courseo: [
    {
      icon: <Copy size={30} />,
      number: "01",
      title: "Copy your enrolment record",
      description: "Open SOLS, go to your enrolment record, and copy the table that lists your subjects and results.",
      detail: "Include the course details and every subject row so Courseo can calculate your completed credit points accurately.",
      media: { src: courseoStepOne, alt: "Selecting and copying the complete enrolment record in SOLS" },
    },
    {
      icon: <MessageCircle size={30} />,
      number: "02",
      title: "Set up Courseo",
      description: "Choose Proceed to Courseo, then sign in or create your account and choose your preferences.",
      detail: "Choose your preferred name and elective interests. Courseo will confirm your commencement year, campus, degree, and major in chat.",
      media: { src: courseoStepTwo, alt: "Opening Courseo, creating an account, and choosing preferences" },
    },
    {
      icon: <KeyRound size={30} />,
      number: "03",
      title: "Enter your Google API key",
      description: "When Courseo asks for an API key, choose Google Gemini and paste your key into the secure API key field.",
      detail: "Need a key? Sign in to Google AI Studio, open API Keys, select Create API key, choose a Google Cloud project, and copy the new key. Return to Courseo and select Connect key.",
      media: { src: courseoStepThree, alt: "Entering and connecting a Google Gemini API key in Courseo" },
      link: { href: "https://aistudio.google.com/apikey", label: "Create a Google API key" },
    },
    {
      icon: <ClipboardCheck size={30} />,
      number: "04",
      title: "Create and refine your plan",
      description: "Paste your copied enrolment record into a new chat, then check the study plan Courseo creates.",
      detail: "Ask Courseo to explain requirements or explore alternatives, and use the official handbook link to verify final enrolment decisions, dates, and course rules.",
      media: { src: courseoStepFour, alt: "Creating and refining your plan" },
    },
  ],
  copilot: [
    {
      icon: <Copilot.Color size={30} />,
      number: "01",
      title: "Choose Microsoft Copilot",
      description: "On the Courseo welcome page, select Microsoft Copilot and enter your commencement year, degree, and campus.",
      detail: "Courseo uses these details to find the matching UOW Copilot agent and tells you if that combination is not available yet.",
      media: { src: copilotStepOne, alt: "Choosing Microsoft Copilot and entering course details in Courseo" },
    },
    {
      icon: <ListChecks size={30} />,
      number: "02",
      title: "Open your course agent",
      description: "Select Open my Copilot agent. Courseo opens the correct Microsoft Copilot page in a new tab.",
      detail: "Your selected course details are copied as a starter prompt. Paste it into Copilot to begin with the right context.",
      media: { src: copilotStepTwo, alt: "Courseo opening the matching UOW Microsoft Copilot agent" },
    },
    {
      icon: <BookOpen size={30} />,
      number: "03",
      title: "Paste, review, and verify",
      description: "Paste your copied enrolment record into the course agent and ask it to create your study plan.",
      detail: "Review the suggested sequence, ask follow-up questions, and check important decisions against the official UOW handbook before changing your enrolment.",
      media: { src: copilotStepThree, alt: "Pasting an enrolment record into Copilot and reviewing the generated study plan" },
    },
  ],
};

function InstructionMedia({ media }: { media: NonNullable<HelpStep["media"]> }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <figure className="relative overflow-hidden rounded-[20px] border border-white/90 bg-[#eef0ff] shadow-[0_18px_44px_rgba(24,25,111,0.13)]">
      <div className="relative aspect-video w-full overflow-hidden">
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#e7e8ff] via-[#f7f7ff] to-[#ddf8ff]" aria-hidden="true" />
        )}
        <img
          src={media.src}
          alt={media.alt}
          width={960}
          height={540}
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    </figure>
  );
}

export function HelpSlider({ onClose }: { onClose: () => void }) {
  const [pathway, setPathway] = useState<Pathway>("courseo");
  const [step, setStep] = useState(0);
  const steps = STEP_SETS[pathway];
  const item = steps[step];

  const choosePathway = (next: Pathway) => {
    setPathway(next);
    setStep(0);
  };

  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain bg-black/35 p-4 touch-pan-y [-webkit-overflow-scrolling:touch] sm:p-6" onClick={onClose} role="presentation">
    <motion.div initial={{ scale: 0.92, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.92, y: 20, opacity: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }} className="relative mx-auto my-auto w-full shrink-0 max-w-[980px] rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:rounded-[32px] sm:p-8" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="help-dialog-title">
      <button type="button" onClick={onClose} className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full text-[#000181] hover:bg-[#f1f3ff]" aria-label="Close help"><X size={21} /></button>

      <div className="flex items-center gap-3 pr-12"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(131,231,255,0.45)] text-[#000181]"><HelpCircle size={21} /></span><div><h2 id="help-dialog-title" className="text-2xl font-extrabold tracking-tight text-[#000181]">How would you like to plan?</h2><p className="mt-1 text-[13px] font-semibold text-[rgba(0,1,129,0.6)]">Follow the steps for Courseo or Microsoft Copilot.</p></div></div>

      <div className="mt-5 grid grid-cols-2 gap-2 rounded-[17px] bg-[#f3f4ff] p-1.5" role="tablist" aria-label="Help topic">
        <button type="button" role="tab" aria-selected={pathway === "courseo"} onClick={() => choosePathway("courseo")} className={`flex min-h-11 items-center justify-center gap-2 rounded-[13px] px-3 text-[12px] font-extrabold transition ${pathway === "courseo" ? "bg-white text-[#000181] shadow-sm" : "text-[rgba(0,1,129,0.55)] hover:text-[#000181]"}`}><MessageCircle size={16} /> Courseo</button>
        <button type="button" role="tab" aria-selected={pathway === "copilot"} onClick={() => choosePathway("copilot")} className={`flex min-h-11 items-center justify-center gap-2 rounded-[13px] px-3 text-[12px] font-extrabold transition ${pathway === "copilot" ? "bg-white text-[#000181] shadow-sm" : "text-[rgba(0,1,129,0.55)] hover:text-[#000181]"}`}><Copilot.Color size={16} /> Microsoft Copilot</button>
      </div>

      <div className="mt-4 min-h-[310px] overflow-hidden rounded-[24px] bg-gradient-to-br from-[rgba(131,231,255,0.2)] to-[rgba(232,160,255,0.16)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${pathway}-${step}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
            className={item.media ? "grid items-center gap-0 lg:grid-cols-[1.25fr_0.75fr]" : ""}
          >
            {item.media && (
              <div className="p-4 pb-0 sm:p-6 sm:pb-0 lg:pb-6 lg:pr-2">
                <InstructionMedia media={item.media} />
              </div>
            )}
            <div className={`p-6 sm:p-8 ${item.media ? "lg:pl-7" : ""}`}>
              <div className="flex items-start justify-between gap-4"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-white text-[#000181] shadow-sm">{item.icon}</span><span className="text-[42px] font-black leading-none text-[rgba(0,1,129,0.12)]">{item.number}</span></div>
              <h3 className="mt-6 text-[23px] font-black leading-tight tracking-tight text-[#000181]">{item.title}</h3>
              <p className="mt-3 text-[14px] font-semibold leading-relaxed text-[rgba(0,1,129,0.72)]">{item.description}</p>
              <p className="mt-4 rounded-[14px] border border-white/80 bg-white/70 px-4 py-3 text-[11px] font-semibold leading-relaxed text-[rgba(0,1,129,0.62)]">{item.detail}</p>
              {item.link && <a href={item.link.href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-[13px] bg-white px-4 py-2 text-[11px] font-extrabold text-[#000181] shadow-sm transition hover:-translate-y-0.5">{item.link.label} <ExternalLink size={13} /></a>}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0} className="flex h-11 items-center gap-2 rounded-[14px] border border-[rgba(0,1,129,0.2)] px-4 text-[12px] font-extrabold text-[#000181] disabled:opacity-35"><ArrowLeft size={15} /> Back</button>
        <div className="flex gap-2" aria-label={`Step ${step + 1} of ${steps.length}`}>{steps.map((_, index) => <button key={index} type="button" onClick={() => setStep(index)} aria-label={`Go to step ${index + 1}`} className={`h-2.5 rounded-full transition-all ${index === step ? "w-7 bg-[#000181]" : "w-2.5 bg-[rgba(0,1,129,0.2)]"}`} />)}</div>
        {step < steps.length - 1 ? <button type="button" onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))} className="flex h-11 items-center gap-2 rounded-[14px] bg-[#000181] px-4 text-[12px] font-extrabold text-white">Next <ArrowRight size={15} /></button> : <button type="button" onClick={onClose} className="h-11 rounded-[14px] bg-[#000181] px-5 text-[12px] font-extrabold text-white">Done</button>}
      </div>
    </motion.div>
  </motion.div>;
}
