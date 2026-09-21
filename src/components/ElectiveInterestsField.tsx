import { Check, GraduationCap, Sparkles } from "lucide-react";
import { useState, type KeyboardEvent } from "react";

export type ElectiveRecommendationMode = "degree" | "interest";

export const ELECTIVE_INTEREST_OPTIONS = [
  "Machine Learning",
  "Cybersecurity",
  "Human-Computer Interaction",
  "Data Engineering",
  "Cloud Computing",
  "Entrepreneurship",
  "Embedded Systems",
];

export function inferElectiveMode(interests: string[]): ElectiveRecommendationMode {
  return interests.length > 0 ? "interest" : "degree";
}

type ElectiveInterestsFieldProps = {
  mode: ElectiveRecommendationMode;
  interests: string[];
  onModeChange: (mode: ElectiveRecommendationMode) => void;
  onInterestsChange: (interests: string[]) => void;
};

export function ElectiveInterestsField({
  mode,
  interests,
  onModeChange,
  onInterestsChange,
}: ElectiveInterestsFieldProps) {
  const [customInterest, setCustomInterest] = useState("");
  const availableInterests = [...new Set([...ELECTIVE_INTEREST_OPTIONS, ...interests])];

  const chooseMode = (nextMode: ElectiveRecommendationMode) => {
    onModeChange(nextMode);
    if (nextMode === "degree") onInterestsChange([]);
  };

  const toggleInterest = (interest: string) => {
    const selected = interests.includes(interest);
    onInterestsChange(selected ? interests.filter((item) => item !== interest) : [...interests, interest]);
  };

  const addCustomInterest = () => {
    const interest = customInterest.trim().replace(/\s+/g, " ");
    if (!interest) return;
    if (!interests.some((item) => item.toLowerCase() === interest.toLowerCase())) {
      onInterestsChange([...interests, interest]);
    }
    setCustomInterest("");
  };

  const handleCustomInterestKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addCustomInterest();
  };

  return (
    <fieldset>
      <legend className="text-[13px] font-extrabold text-[#000181]">Elective interests</legend>
      <p className="mt-1 text-[11px] font-semibold leading-relaxed text-[rgba(0,1,129,0.55)]">
        Choose how Courseo should tailor elective suggestions.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Elective recommendation method">
        <label className={`relative flex cursor-pointer gap-3 rounded-[17px] border-2 p-4 transition ${mode === "degree" ? "border-[#000181] bg-[#eef0ff] shadow-[0_8px_22px_rgba(0,1,129,0.08)]" : "border-[rgba(0,1,129,0.14)] bg-white hover:border-[rgba(0,1,129,0.35)]"}`}>
          <input
            type="radio"
            name="elective-recommendation-mode"
            value="degree"
            checked={mode === "degree"}
            onChange={() => chooseMode("degree")}
            className="sr-only"
          />
          <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${mode === "degree" ? "bg-[#000181] text-white" : "bg-[#eef0ff] text-[#000181]"}`}>
            <GraduationCap size={18} />
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-2 text-[12px] font-extrabold text-[#000181]">
              Degree-based
              {mode === "degree" && <Check size={14} strokeWidth={3} />}
            </span>
            <span className="mt-1 block text-[10px] font-semibold leading-relaxed text-[rgba(0,1,129,0.58)]">
              Recommend electives from your degree and major.
            </span>
          </span>
        </label>

        <label className={`relative flex cursor-pointer gap-3 rounded-[17px] border-2 p-4 transition ${mode === "interest" ? "border-[#000181] bg-[rgba(131,231,255,0.16)] shadow-[0_8px_22px_rgba(0,1,129,0.08)]" : "border-[rgba(0,1,129,0.14)] bg-white hover:border-[rgba(0,1,129,0.35)]"}`}>
          <input
            type="radio"
            name="elective-recommendation-mode"
            value="interest"
            checked={mode === "interest"}
            onChange={() => chooseMode("interest")}
            className="sr-only"
          />
          <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${mode === "interest" ? "bg-[#000181] text-white" : "bg-[#eef0ff] text-[#000181]"}`}>
            <Sparkles size={17} />
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-2 text-[12px] font-extrabold text-[#000181]">
              Interest-based
              {mode === "interest" && <Check size={14} strokeWidth={3} />}
            </span>
            <span className="mt-1 block text-[10px] font-semibold leading-relaxed text-[rgba(0,1,129,0.58)]">
              Recommend electives from topics you choose.
            </span>
          </span>
        </label>
      </div>

      {mode === "interest" && (
        <div className="mt-4 rounded-[17px] border border-[rgba(0,1,129,0.13)] bg-white/75 p-4">
          <p className="text-[11px] font-extrabold text-[#000181]">Select or add your interests</p>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Elective interests">
            {availableInterests.map((interest) => {
              const selected = interests.includes(interest);
              const limitReached = interests.length >= 12 && !selected;
              return (
                <button
                  key={interest}
                  type="button"
                  aria-pressed={selected}
                  disabled={limitReached}
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-full border px-3 py-2 text-[11px] font-extrabold transition disabled:cursor-not-allowed disabled:opacity-35 ${selected ? "border-[#000181] bg-[rgba(232,160,255,0.42)] text-[#000181]" : "border-[rgba(0,1,129,0.18)] bg-[rgba(131,231,255,0.08)] text-[rgba(0,1,129,0.62)] hover:border-[#000181] hover:text-[#000181]"}`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              aria-label="Additional elective interest"
              type="text"
              value={customInterest}
              maxLength={80}
              disabled={interests.length >= 12}
              onChange={(event) => setCustomInterest(event.target.value)}
              onKeyDown={handleCustomInterestKeyDown}
              placeholder={interests.length >= 12 ? "Maximum 12 interests" : "Add another interest…"}
              className="h-10 min-w-0 flex-1 rounded-[13px] border border-[rgba(0,1,129,0.2)] bg-white px-3 text-[12px] font-bold text-[#000181] outline-none placeholder:text-[rgba(0,1,129,0.36)] focus:border-[#000181] disabled:bg-[#f3f3f8]"
            />
            <button
              type="button"
              onClick={addCustomInterest}
              disabled={!customInterest.trim() || interests.length >= 12}
              className="rounded-[12px] bg-[#000181] px-4 text-[11px] font-extrabold text-white disabled:opacity-40"
            >
              Add
            </button>
          </div>
          {interests.length === 0 && (
            <p className="mt-2 text-[10px] font-bold text-amber-700">Add at least one interest to use interest-based recommendations.</p>
          )}
        </div>
      )}
    </fieldset>
  );
}
