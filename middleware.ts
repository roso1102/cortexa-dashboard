import { NextRequest, NextResponse } from "next/server";
import { DASHBOARD_TOKEN_KEY } from "@/lib/auth";

const LOGIN_PATH = "/login";
const LANDING_PATH = "/";
const PUBLIC_PATHS = new Set([LANDING_PATH, LOGIN_PATH]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(DASHBOARD_TOKEN_KEY)?.value;

  if (pathname === LOGIN_PATH) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
