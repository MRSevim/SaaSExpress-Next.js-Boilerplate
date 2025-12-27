import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { routes } from "./utils/routes";
import { auth } from "./features/auth/lib/auth";

export default async function proxy(request: NextRequest) {
  /*
   * ==============================
   *  AUTH REDIRECT LOGIC
   * ==============================
   */
  const requiresAuth = [routes.profile].some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session && requiresAuth) {
    return NextResponse.redirect(new URL(routes.signIn, request.url));
  }

  const requiresNoUser = [routes.signIn, routes.signUp].some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (session && requiresNoUser) {
    return NextResponse.redirect(new URL(routes.home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
