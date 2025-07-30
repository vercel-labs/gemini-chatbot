"use client";

import { Attachment, ChatRequestOptions, CreateMessage, Message } from "ai";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
  ChangeEvent,
} from "react";
import { toast } from "sonner";

import { ArrowUpIcon, PaperclipIcon, StopIcon } from "./icons";
import { PreviewAttachment } from "./preview-attachment";
import useWindowSize from "./use-window-size";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";


const suggestedActions = [
  {
    title: "Book a train ",
    label: "from Roma Termini to Firenze SMN",
    action: "Help me book a train from Rome to Florence",
  },
  {
    title: "What is the status",
    label: "of train ITALO9512 departing tomorrow?",
    action: "What is the status of train ITALO9512 departing tomorrow?",
  },
];

export function MultimodalInput({
  input,
  setInput,
  isLoading,
  stop,
  attachments,
  setAttachments,
  messages,
  append,
  handleSubmit,
}: {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<Message>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 0}px`;
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = useCallback(() => {
    handleSubmit(undefined, {
      experimental_attachments: attachments,
    });

    setAttachments([]);

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [attachments, handleSubmit, setAttachments, width]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/files/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      } else {
        const { error } = await response.json();
        toast.error(error);
      }
    } catch (error) {
      toast.error("Failed to upload file, please try again!");
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined,
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error("Error uploading files!", error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );

  const { data: session } = useSession();
  const email = session?.user?.email || "";
  const userName = email.split("@")[0]
    ? email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1)
    : "";

  const greetings = [
    `Ciao ${userName}! Where are we heading?`,
    `All Aboard, Which station's on your mind?`,
    `Buongiorno! What's your next stop?`,
    `Next Journey, ${userName}? Tell me where!`,
    `Ciao! Which city should we explore?`
  ];
  const [greetingIndex, setGreetingIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingIndex((i) => (i + 1) % greetings.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [greetings.length]);

  return (
    <div className="relative w-full flex flex-col gap-4">
      {/* Show greeting and suggested actions only for new chat */}
      {messages.length === 0 && (
        <>
          <div
            className="w-full flex justify-center items-center my-2"
            style={{
              minHeight: "2.5rem",
              height: "2.5rem",
              perspective: "800px"
            }}
          >
            <motion.div
              key={greetingIndex}
              initial={{ rotateX: -90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: 90, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-semibold"
              style={{
                textAlign: "center",
                display: "inline-block",
                width: "100%",
                backfaceVisibility: "hidden"
              }}
            >
              {greetings[greetingIndex]}
            </motion.div>
          </div>
          {/* Suggested actions below input, always visible for new chat */}
          <div className="grid sm:grid-cols-2 gap-4 w-full md:px-0 mx-auto md:max-w-[500px] mt-4">
            {suggestedActions.map((suggestedAction, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.05 * index }}
                key={index}
                className={index > 1 ? "hidden sm:block" : "block"}
              >
                <button
                  onClick={async () => {
                    append({
                      role: "user",
                      content: suggestedAction.action,
                    });
                  }}
                  className="border-none bg-muted/50 w-full text-left border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 rounded-lg p-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex flex-col"
                >
                  <span className="font-medium">{suggestedAction.title}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {suggestedAction.label}
                  </span>
                </button>
              </motion.div>
            ))}
          </div>
        </>
      )}

      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div className="flex flex-row gap-2 overflow-x-scroll">
          {attachments.map((attachment) => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}

          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: "",
                name: filename,
                contentType: "",
              }}
              isUploading={true}
            />
          ))}
        </div>
      )}

      <div className="relative w-full flex flex-row items-center bg-muted rounded-lg">
        <Textarea
          ref={textareaRef}
          placeholder="Send a message..."
          value={input}
          onChange={handleInput}
          className="min-h-[24px] overflow-hidden resize-none rounded-lg text-base bg-muted border-none pr-20"
          rows={3}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();

              if (isLoading) {
                toast.error("Please wait for the model to finish its response!");
              } else {
                submitForm();
              }
            }
          }}
        />
        <div className="absolute right-2 bottom-2 flex flex-row gap-2">
          <Button
            className="rounded-full p-1.5 h-fit m-0.5 text-zinc-700 dark:text-zinc-300"
            onClick={(event) => {
              event.preventDefault();
              fileInputRef.current?.click();
            }}
            variant="outline"
            disabled={isLoading}
            type="button"
          >
            <PaperclipIcon size={14} />
          </Button>
          {isLoading ? (
            <Button
              className="rounded-full p-1.5 h-fit m-0.5 text-white"
              onClick={(event) => {
                event.preventDefault();
                stop();
              }}
              type="button"
            >
              <StopIcon size={14} />
            </Button>
          ) : (
            <Button
              className="rounded-full p-1.5 h-fit m-0.5 text-white"
              onClick={(event) => {
                event.preventDefault();
                submitForm();
              }}
              disabled={input.length === 0 || uploadQueue.length > 0}
              type="button"
            >
              <ArrowUpIcon size={14} />
            </Button>
          )}
        </div>
      </div>

    </div>
  );
}
