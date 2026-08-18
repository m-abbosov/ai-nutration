import { useTranslation } from "@nutriai/shared/i18n";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "@/app/providers/auth-provider";

import { Avatar } from "@/shared/ui/avatar";

import { ThemeToggle } from "@/features/theme-toggle/theme-toggle";

import { DateNav } from "@/widgets/date-nav/date-nav";

export function AppHeader() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <header className="z-30 flex flex-none flex-wrap items-end gap-5 border-b border-line bg-glass px-[22px] py-[18px] pt-[26px] backdrop-blur-[14px] md:px-[34px]">
      <div className="min-w-[240px] flex-1">
        <h1 className="m-0 text-[22px] font-medium leading-[1.15] tracking-[-.02em] md:text-[26px]">
          {t.greet}
          {user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="m-0 mt-[5px] text-[13.5px] text-tx2">{t.greetSub}</p>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="hidden sm:block">
          <DateNav compact />
        </div>
        <ThemeToggle />
        <button className="grid h-[34px] w-[34px] place-items-center rounded-[10px] border border-line text-tx2 transition-colors hover:bg-surf2 hover:text-tx">
          <Bell className="h-[15px] w-[15px]" />
        </button>
        <Link to="/profile" title={t.navProf}>
          <Avatar user={user} className="h-[34px] w-[34px]" textClassName="text-[13px]" />
        </Link>
      </div>
    </header>
  );
}
