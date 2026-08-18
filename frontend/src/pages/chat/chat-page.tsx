import { useState } from "react";

import { useTranslation } from "@nutriai/shared/i18n";
import { X } from "lucide-react";
import { useParams } from "react-router-dom";

import { ChatSidebar } from "@/widgets/chat-sidebar/chat-sidebar";
import { ChatWindow } from "@/widgets/chat-window/chat-window";

export function ChatPage() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex h-full animate-fi">
      <div className="hidden w-[246px] flex-none overflow-y-auto border-r border-line lg:block">
        <ChatSidebar activeId={conversationId} />
      </div>

      <div className="relative flex min-w-0 flex-1">
        <ChatWindow conversationId={conversationId} onOpenHistory={() => setDrawerOpen(true)} />
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-[60] animate-fi lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[82%] max-w-[300px] flex-col gap-3.5 border-r border-line2 bg-bg2 p-3.5 shadow-[24px_0_60px_-20px_rgba(0,0,0,.6)]">
            <div className="flex items-center gap-2.5 px-1">
              <span className="flex-1 text-[14px] font-semibold">{t.mb.hist}</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="grid h-[30px] w-[30px] place-items-center rounded-[9px] text-tx3 hover:bg-surf2"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ChatSidebar activeId={conversationId} onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
