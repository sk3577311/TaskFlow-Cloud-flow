import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define which routes require authentication
const PROTECTED_ROUTES = ["/", "/jobs", "/tasks", "/workers"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Read the apiKey cookie (set by AuthContext on login)
  const apiKey = req.cookies.get("apiKey")?.value;

  // ✅ 1. Redirect unauthenticated users trying to access protected pages
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isProtected && !apiKey) {
    const loginUrl = new URL("/auth", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ 2. Redirect authenticated users away from /auth (no infinite loops)
  if (pathname.startsWith("/auth") && apiKey) {
    const homeUrl = new URL("/", req.url);
    return NextResponse.redirect(homeUrl);
  }

  // ✅ 3. Allow the request if everything is fine
  return NextResponse.next();
}

// ✅ Apply middleware only to relevant routes
export const config = {
  matcher: ["/", "/auth", "/jobs/:path*", "/tasks/:path*", "/workers/:path*"],
};
