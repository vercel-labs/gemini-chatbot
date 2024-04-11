import Link from 'next/link'
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex space-x-2 w-full fixed inset-0 bg-card  justify-center items-center">
      <div className=" grid place-items-center">
        <h1 className="text-9xl"> 404 </h1>
        <h1 className="text-3xl my-5"> Page not found </h1>
        <Link href={"/"}>
          <Button variant={"outline"}>Back to home</Button>
        </Link>
      </div>
    </div>
  )
}