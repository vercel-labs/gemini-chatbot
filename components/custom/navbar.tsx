import Image from "next/image";
import Link from "next/link";

import { History } from "./history";
import { SlashIcon, VercelIcon } from "./icons";

export const Navbar = async () => {
  return (
    <div className="bg-background absolute top-0 left-0 w-dvw py-2 px-3 justify-between flex flex-row items-center z-30">
      <div className="flex flex-row gap-3 items-center">
        <History />
        <Link href="/" className="flex flex-row gap-2 items-center hover:opacity-80 transition-opacity">
          <Image
            src="/images/gemini-logo.png"
            height={20}
            width={20}
            alt="gemini logo"
          />
          <div className="text-zinc-500">
            <SlashIcon size={16} />
          </div>
          <div className="text-sm dark:text-zinc-300">
            Gemini Reasoning
          </div>
        </Link>
      </div>

      <Link
        href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel-labs%2Fgemini-chatbot&env=GOOGLE_GENERATIVE_AI_API_KEY&envDescription=Get%20your%20Google%20AI%20API%20key&envLink=https%3A%2F%2Faistudio.google.com%2Fapp%2Fapikey"
        target="_blank"
        className="hidden md:flex items-center gap-2 rounded-lg bg-foreground text-background px-3 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity"
      >
        <VercelIcon size={14} />
        Deploy with Vercel
      </Link>
    </div>
  );
};
