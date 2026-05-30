import { motion } from "framer-motion";
import Link from "next/link";

import { MessageIcon, VercelIcon } from "./icons";

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-[700px] mt-20 mx-4 md:mx-0 flex flex-col items-center gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Gemini Reasoning
        </h1>

        <div className="rounded-xl border border-border bg-muted/30 p-5 max-w-lg text-sm text-muted-foreground leading-relaxed">
          <p className="flex justify-center gap-3 items-center text-foreground mb-3">
            <VercelIcon />
            <span className="text-muted-foreground">+</span>
            <MessageIcon />
          </p>
          <p>
            An open source image reasoning demo powered by Google Gemini, built
            with Next.js and{" "}
            <Link
              href="https://sdk.vercel.ai"
              target="_blank"
              className="text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors"
            >
              AI SDK v7 beta
            </Link>
            . It uses{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
              streamText
            </code>{" "}
            on the server and{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
              useChat
            </code>{" "}
            on the client to stream reasoning and images in real time.
          </p>
          <p className="mt-3">
            Learn more about the AI SDK by visiting the{" "}
            <Link
              href="https://sdk.vercel.ai/docs"
              target="_blank"
              className="text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors"
            >
              Docs
            </Link>
            .
          </p>
        </div>
      </div>
    </motion.div>
  );
};
