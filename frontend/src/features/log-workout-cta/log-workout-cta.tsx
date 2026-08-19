import { useTranslation } from "@nutriai/shared/i18n";
import { cn } from "@nutriai/shared/lib/cn";
import { Link } from "react-router-dom";

/** Opens the existing AI chat — per spec, logging a workout is never a
 * separate form as the primary entry point, just like meal logging. */
export function LogWorkoutCta({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <Link
      to="/chat"
      className={cn(
        "inline-flex items-center gap-2 rounded-[11px] bg-acc px-[15px] py-2.5 text-[12.5px] font-semibold text-[#04120e] transition-[filter] hover:brightness-[1.08] active:scale-[0.97]",
        className,
      )}
    >
      {t.fitness.logWorkoutCta}
      <span className="font-mono">→</span>
    </Link>
  );
}
