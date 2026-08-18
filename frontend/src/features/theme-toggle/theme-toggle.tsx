import { Moon, Sun } from "lucide-react";

import { useAuth } from "@/app/providers/auth-provider";
import { useThemeContext } from "@/app/providers/theme-provider";

import { useUpdateMe } from "@/shared/api/users";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useThemeContext();
  const { isAuthenticated } = useAuth();
  const updateMe = useUpdateMe();

  const handleClick = () => {
    const next = theme === "DARK" ? "LIGHT" : "DARK";
    toggleTheme();
    if (isAuthenticated) updateMe.mutate({ theme: next });
  };

  return (
    <button
      onClick={handleClick}
      title="Theme"
      className={
        className ??
        "grid h-[34px] w-[34px] place-items-center rounded-[10px] border border-line text-tx2 transition-colors hover:bg-surf2 hover:text-tx"
      }
    >
      {theme === "DARK" ? <Moon className="h-[15px] w-[15px]" /> : <Sun className="h-[15px] w-[15px]" />}
    </button>
  );
}
