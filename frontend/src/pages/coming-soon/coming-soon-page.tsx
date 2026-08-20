import { useTranslation } from "@nutriai/shared/i18n";
import { Sparkles } from "lucide-react";

export function ComingSoonPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-5 py-16 text-center">
      <div className="relative mb-6 h-[104px] w-[104px]">
        <div
          className="absolute -inset-4 animate-halo rounded-full blur-[18px]"
          style={{ background: "radial-gradient(circle, var(--accG), transparent 66%)" }}
        />
        <div
          className="absolute inset-[14px] grid animate-drift place-items-center rounded-full"
          style={{
            background: "radial-gradient(circle at 34% 26%, var(--acc), var(--accD) 55%, var(--surf) 96%)",
            boxShadow: "inset 0 0 18px rgba(255,255,255,.25), 0 8px 28px -8px var(--accG)",
          }}
        >
          <Sparkles className="h-6 w-6 text-[#04120e]" />
        </div>
      </div>
      <h1 className="m-0 max-w-[22ch] text-pretty font-serif text-[26px] font-normal leading-[1.2] tracking-[-.01em] md:text-[30px]">
        {t.fitness.comingSoonTitle}
      </h1>
      <p className="m-0 mt-3 max-w-[44ch] text-pretty text-[13.5px] leading-[1.55] text-tx2">{t.fitness.comingSoonBody}</p>
    </div>
  );
}
