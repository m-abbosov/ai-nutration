import { useTranslation } from "@nutriai/shared/i18n";
import { cn } from "@nutriai/shared/lib/cn";
import { NavLink } from "react-router-dom";

import { CoachIcon, DashIcon, MealsIcon, ProfIcon, ProgIcon } from "@/shared/ui/nav-icons";

const items = [
  { to: "/dashboard", key: "home" as const, Icon: DashIcon },
  { to: "/chat", key: "chat" as const, Icon: CoachIcon },
  { to: "/meals", key: "meals" as const, Icon: MealsIcon },
  { to: "/progress", key: "prog" as const, Icon: ProgIcon },
  { to: "/profile", key: "me" as const, Icon: ProfIcon },
];

export function MobileBottomNav() {
  const { t } = useTranslation();

  return (
    <nav className="z-40 flex flex-none items-stretch gap-0.5 border-t border-line bg-bg2 px-2.5 pb-3 pt-2 [padding-bottom:calc(0.75rem+env(safe-area-inset-bottom))]">
      {items.map(({ to, key, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/dashboard"}
          className={({ isActive }) =>
            cn(
              "flex min-h-[48px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-1 transition-colors",
              isActive ? "bg-accT text-acc" : "text-tx3",
            )
          }
        >
          <Icon width={17} height={17} />
          <span className="text-[9.5px] font-medium tracking-[.01em]">{t.mb[key]}</span>
        </NavLink>
      ))}
    </nav>
  );
}
