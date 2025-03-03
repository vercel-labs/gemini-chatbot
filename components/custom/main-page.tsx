'use client';

import Link from 'next/link';

import { generateUUID } from '../../lib/utils';

const MainPage = () => {

  return (
    <div className="flex justify-center items-center pb-4 md:pb-8 h-dvh bg-background flex-col">
      <div className="p-4">
        <Link
          href={`/login`}
          className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
        >
          Login
        </Link>
      </div>
      <div className="p-4">
        <Link
          href="/demo"
          className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
        >
          Demo
        </Link>
      </div>
    </div>
  );
};

export default MainPage;
