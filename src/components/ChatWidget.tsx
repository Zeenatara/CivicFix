import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageCircle, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";

function Avatar() {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12l4 4 10-10" /></svg>
    </span>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();
  return (
    <>
      {open && (
        <div className="animate-rise fixed bottom-24 right-4 z-50 flex h-[min(600px,calc(100vh-8rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border bg-background shadow-lift">
          {loading ? null : user ? <ChatPanel userId={user.id} onClose={() => setOpen(false)} /> : (
            <div className="flex flex-1 flex-col">
              <Header onClose={() => setOpen(false)} />
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
                <p className="text-sm text-muted-foreground">Sign in to chat with the CivicFix assistant. Your chat is saved to your account.</p>
                <Link to="/auth" onClick={() => setOpen(false)} className="inline-flex h-10 items-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground">Sign in</Link>
              </div>
            </div>
          )}
        </div>
      )}
      <button onClick={() => setOpen(!open)} aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-5 right-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lift transition hover:-translate-y-0.5">
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}

function Header({ onClose, onReset }: { onClose: () => void; onReset?: () => void }) {
  return (
    <div className="flex items-center gap-3 border-b px-4 py-3">
      <Avatar />
      <div className="flex-1">
        <p className="text-sm font-semibold">CivicFix Assistant</p>
        <p className="text-xs text-muted-foreground">Help with reporting issues</p>
      </div>
      {onReset && <button onClick={onReset} aria-label="New chat" title="New chat" className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><RotateCcw className="h-4 w-4" /></button>}
      <button onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
    </div>
  );
}

function ChatPanel({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [initial, setInitial] = useState<UIMessage[] | null>(null);
  useEffect(() => {
    supabase.from("chat_messages").select("message").order("created_at").then(({ data, error }) => {
      if (error) toast.error("Couldn't load your chat history.");
      setInitial((data ?? []).map((r) => r.message as unknown as UIMessage));
    });
  }, [userId]);
  if (!initial) return <><Header onClose={onClose} /><div className="p-6"><Shimmer>Loading chat…</Shimmer></div></>;
  return <ChatInner initial={initial} userId={userId} onClose={onClose} />;
}

function ChatInner({ initial, userId, onClose }: { initial: UIMessage[]; userId: string; onClose: () => void }) {
  const [text, setText] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const { messages, sendMessage, status, stop, setMessages } = useChat({
    id: `civicfix-${userId}`,
    messages: initial,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      headers: async (): Promise<Record<string, string>> => {
        const { data } = await supabase.auth.getSession();
        return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
      },
    }),
    onError: (e) => {
      const m = e.message || "";
      if (m.includes("429")) toast.error("Too many requests. Please wait a moment.");
      else if (m.includes("402")) toast.error("AI credits have run out.");
      else toast.error(m.startsWith("{") ? (JSON.parse(m).error ?? "Something went wrong.") : "Something went wrong. Please try again.");
    },
  });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => { taRef.current?.focus(); }, [status]);

  const reset = async () => {
    const { error } = await supabase.from("chat_messages").delete().eq("user_id", userId);
    if (error) { toast.error("Couldn't clear chat."); return; }
    setMessages([]);
  };

  return (
    <>
      <Header onClose={onClose} onReset={messages.length ? reset : undefined} />
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 && (
            <ConversationEmptyState icon={<Avatar />} title="Hi! How can I help?" description="Ask how to report a problem, which category to pick, or how to download your complaint." />
          )}
          {messages.map((m) => (
            <Message key={m.id} from={m.role}>
              <MessageContent className={m.role === "user" ? "bg-primary text-primary-foreground" : ""}>
                {m.parts.map((p, i) => p.type === "text" ? (m.role === "assistant" ? <MessageResponse key={i}>{p.text}</MessageResponse> : <span key={i} className="whitespace-pre-wrap">{p.text}</span>) : null)}
              </MessageContent>
            </Message>
          ))}
          {status === "submitted" && <Shimmer className="text-sm">Thinking…</Shimmer>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="border-t p-3">
        <PromptInput onSubmit={({ text: t }) => { if (!t?.trim() || busy) return; sendMessage({ text: t }); setText(""); }}>
          <PromptInputTextarea ref={taRef} value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about reporting an issue…" />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} onStop={stop} disabled={!busy && !text.trim()} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </>
  );
}
