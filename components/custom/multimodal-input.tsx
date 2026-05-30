"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useRef, useEffect, useCallback, useState, forwardRef } from "react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

import { ArrowUpIcon, StopIcon } from "./icons";
import useWindowSize from "./use-window-size";

import type { UIMessage } from "ai";
import type { ModelId } from "@/lib/models";
import { labels, shortLabels, modelIds } from "@/lib/models";

const suggestedActions = [
  {
    title: "Draw Pikachu",
    label: "in a field of flowers",
    action: "Draw me Pikachu playing in a field of flowers",
  },
  {
    title: "Create an anime scene",
    label: "of a samurai at sunset",
    action: "Create an anime scene of a samurai standing on a cliff at sunset with cherry blossoms",
  },
];

interface Command {
  name: string;
  description: string;
  shortcut: string;
  action: () => void;
}

export const MultimodalInput = forwardRef<HTMLTextAreaElement, {
  input: string;
  setInput: (value: string) => void;
  status: string;
  stop: () => void;
  messages: Array<UIMessage>;
  sendMessage: (options: { text: string }) => void;
  modelId: ModelId;
  setModelId: (id: ModelId) => void;
  onClear: () => void;
  onDelete: () => void;
}>(function MultimodalInput({
  input,
  setInput,
  status,
  stop,
  messages,
  sendMessage,
  modelId,
  setModelId,
  onClear,
  onDelete,
}, forwardedRef) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = (forwardedRef as React.RefObject<HTMLTextAreaElement | null>) ?? internalRef;
  const { width } = useWindowSize();
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (textareaRef.current) adjustHeight();
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    setSelectedIndex(0);
    adjustHeight();
  };

  const isLoading = status !== "ready";

  const commands: Command[] = [
    {
      name: "new",
      description: "Start a new chat",
      shortcut: "/new",
      action: () => {
        router.push("/");
        router.refresh();
      },
    },
    {
      name: "clear",
      description: "Clear current conversation",
      shortcut: "/clear",
      action: onClear,
    },
    {
      name: "delete",
      description: "Delete this chat",
      shortcut: "/delete",
      action: onDelete,
    },
    {
      name: "stop",
      description: "Stop generation",
      shortcut: "/stop",
      action: stop,
    },
    {
      name: "theme",
      description: `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
      shortcut: "/theme",
      action: () => setTheme(theme === "dark" ? "light" : "dark"),
    },
    {
      name: "help",
      description: "Show all commands and shortcuts",
      shortcut: "/help",
      action: () => {
        toast(
          <div className="flex flex-col gap-2 text-sm">
            <div className="font-medium">Commands</div>
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              <span className="font-mono text-primary">/new</span><span>New chat</span>
              <span className="font-mono text-primary">/clear</span><span>Clear conversation</span>
              <span className="font-mono text-primary">/delete</span><span>Delete chat</span>
              <span className="font-mono text-primary">/stop</span><span>Stop generation</span>
              <span className="font-mono text-primary">/theme</span><span>Toggle dark/light</span>
              <span className="font-mono text-primary">/model</span><span>Switch model</span>
              <span className="font-mono text-primary">/help</span><span>This menu</span>
            </div>
            <div className="font-medium mt-1">Shortcuts</div>
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              <kbd className="font-mono text-primary">Cmd+N</kbd><span>New chat</span>
              <kbd className="font-mono text-primary">Cmd+K</kbd><span>Command palette</span>
              <kbd className="font-mono text-primary">Cmd+Shift+Del</kbd><span>Delete chat</span>
              <kbd className="font-mono text-primary">Esc</kbd><span>Close commands</span>
            </div>
          </div>,
          { duration: 8000 },
        );
      },
    },
    ...modelIds.map((id) => ({
      name: `model ${shortLabels[id].toLowerCase()}`,
      description: `Switch to ${labels[id]}`,
      shortcut: `/model ${shortLabels[id].toLowerCase()}`,
      action: () => {
        setModelId(id);
        toast.success(`Switched to ${labels[id]}`);
      },
    })),
  ];

  const isCommand = input.startsWith("/");
  const query = isCommand ? input.slice(1).toLowerCase() : "";
  const filtered = isCommand
    ? commands.filter(
        (cmd) =>
          cmd.name.includes(query) ||
          cmd.shortcut.includes(input.toLowerCase()),
      )
    : [];

  const executeCommand = useCallback(
    (cmd: Command) => {
      cmd.action();
      setInput("");
    },
    [setInput],
  );

  const submitForm = useCallback(() => {
    if (!input.trim()) return;

    if (isCommand && filtered.length > 0) {
      executeCommand(filtered[selectedIndex] ?? filtered[0]);
      return;
    }

    if (isCommand) {
      toast.error("Unknown command");
      return;
    }

    sendMessage({ text: input });
    setInput("");

    if (width && width > 768) textareaRef.current?.focus();
  }, [
    input,
    isCommand,
    filtered,
    selectedIndex,
    executeCommand,
    sendMessage,
    setInput,
    width,
  ]);

  return (
    <div className="flex flex-col gap-3">
      {messages.length === 0 && !isCommand && (
        <div className="grid sm:grid-cols-2 gap-3 w-full">
          {suggestedActions.map((action, index) => (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              key={index}
            >
              <button
                type="button"
                onClick={() => sendMessage({ text: action.action })}
                className="w-full text-left rounded-xl border border-border p-3.5 text-sm hover:bg-muted/50 transition-colors flex flex-col gap-0.5"
              >
                <span className="font-medium text-foreground">
                  {action.title}
                </span>
                <span className="text-muted-foreground">{action.label}</span>
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isCommand && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="rounded-xl border border-border bg-background shadow-lg overflow-hidden"
          >
            {filtered.map((cmd, i) => (
              <button
                key={cmd.shortcut}
                type="button"
                onClick={() => executeCommand(cmd)}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                  i === selectedIndex
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <span className="font-mono text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  {cmd.shortcut}
                </span>
                <span>{cmd.description}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative rounded-2xl border border-border bg-muted/30 focus-within:border-primary/40 transition-colors">
        <textarea
          ref={textareaRef}
          placeholder="Message or / for commands..."
          value={input}
          onChange={handleInput}
          className="w-full resize-none bg-transparent px-4 pt-3 pb-12 text-[15px] outline-none placeholder:text-muted-foreground min-h-[52px] max-h-[200px]"
          rows={1}
          onKeyDown={(event) => {
            if (isCommand && filtered.length > 0) {
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setSelectedIndex((prev) =>
                  prev > 0 ? prev - 1 : filtered.length - 1,
                );
                return;
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setSelectedIndex((prev) =>
                  prev < filtered.length - 1 ? prev + 1 : 0,
                );
                return;
              }
              if (event.key === "Tab") {
                event.preventDefault();
                const cmd = filtered[selectedIndex];
                if (cmd) setInput(cmd.shortcut);
                return;
              }
            }

            if (event.key === "Escape" && isCommand) {
              event.preventDefault();
              setInput("");
              return;
            }

            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (isLoading && !isCommand) {
                toast.error(
                  "Please wait for the model to finish its response!",
                );
              } else {
                submitForm();
              }
            }
          }}
        />

        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 pb-2.5">
          <div className="flex items-center gap-1">
            {modelIds.map((id) => (
              <button
                type="button"
                key={id}
                onClick={() => setModelId(id)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                  modelId === id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span className="hidden md:inline">{labels[id]}</span>
                <span className="md:hidden">{shortLabels[id]}</span>
              </button>
            ))}
          </div>

          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="p-1.5 rounded-lg bg-foreground text-background hover:opacity-80 transition-opacity"
            >
              <StopIcon size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={submitForm}
              disabled={input.length === 0}
              className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-80 transition-opacity disabled:opacity-30"
            >
              <ArrowUpIcon size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
