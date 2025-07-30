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
      <div className="bg-background absolute top-0 left-0 w-dvw py-1 px-2 justify-between flex flex-row items-center z-30">
        <div className="flex flex-row gap-3 items-center">
          <div className="flex flex-row gap-2 items-center">
            <Link href="/" passHref>
              <Image
                src="/images/italia-rail.png"
                height={200}
                width={200}
                alt="Italia Rail logo"
                priority
                style={{ width: 'auto', height: 'auto', cursor: 'pointer' }}
              />
            </Link>
          </div>
        </div>

        <div className="flex flex-row gap-2 items-center">
          {session ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-emerald-600">
                    <Image
                      src="/images/person.png"
                      alt="User avatar"
                      width={40}
                      height={40}
                      style={{ width: "40px", height: "40px" }}
                    />
                  </div>
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
