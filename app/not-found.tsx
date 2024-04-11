import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex space-x-2 w-full fixed inset-0 bg-card  justify-center items-center">
      <div className=" grid place-items-center">
        <h1 className="text-9xl scroll-m-20 font-extrabold tracking-tight">
          {' '}
          404{' '}
        </h1>
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight my-5">
          Page not found
        </h4>
        <Link href={'/'}>
          <Button>Back to home</Button>
        </Link>
      </div>
    </div>
  )
}
