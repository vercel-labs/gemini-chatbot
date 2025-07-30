import Image from "next/image";
import Link from "next/link";

import { auth, signOut } from "@/app/(auth)/auth";

import { History } from "./history";
import { SlashIcon } from "./icons";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const Navbar = async () => {
  let session = await auth();

  return (
    <>
      <div className="bg-background absolute top-0 left-0 w-dvw py-2 px-3 justify-between flex flex-row items-center z-30">
        <div className="flex flex-row gap-3 items-center">
          <div className="flex flex-row gap-2 items-center">
            <Image
              src="/images/italia-rail.png"
              height={200}
              width={200}
              alt="Italia Rail logo"
            />
          </div>
        </div>

        <div className="flex flex-row gap-2 items-center">
          {session ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="py-1.5 px-2 font-normal rounded-full bg-emerald-600 text-white size-8 flex items-center justify-center text-lg"
                    variant="secondary"
                  >
                    {session.user?.email?.slice(0, 2).toUpperCase()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    {session.user?.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ThemeToggle />
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-1 z-50">
                    <form
                      className="w-full"
                      action={async () => {
                        "use server";
                        await signOut({
                          redirectTo: "/",
                        });
                      }}
                    >
                      <button
                        type="submit"
                        className="w-full text-left px-1 py-0.5 text-red-500"
                      >
                        Sign out
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <History user={session?.user} triggerOnly />
            </>
          ) : (
            <Button className="py-1.5 px-2 h-fit font-normal text-white" asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
