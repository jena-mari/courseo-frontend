import { FileDown } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import MyDocument from "../functions/pdf";
import type { StudyPlanResponse } from "../types/studyPlanType";

export default function StudyPlanDownload({ studyPlan }: { studyPlan: StudyPlanResponse }) {
  return (
    <PDFDownloadLink
      document={<MyDocument studyPlan={studyPlan} />}
      fileName="myStudyPlan.pdf"
      className="flex h-9 max-w-[125px] cursor-pointer items-center gap-2 overflow-hidden rounded-[15px] bg-[rgba(232,160,255,0.5)] px-5 transition-colors hover:bg-[rgba(232,160,255,0.9)]"
    >
      {({ loading }) => (
        <div className="flex items-center gap-2">
          <FileDown size={14} className="shrink-0 text-[#000181]" />
          <span className="whitespace-nowrap text-[11px] font-extrabold text-[#000181]">
            {loading ? "Preparing…" : "Study plan"}
          </span>
        </div>
      )}
    </PDFDownloadLink>
  );
}
