
// AUTH MIDDLEWARE DISABLED
import { NextRequest, NextResponse } from "next/server";

export default function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/:id", "/api/:path*", "/login", "/register"],
};
