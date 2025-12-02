import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define the paths that are public and don't require authentication
const publicPaths = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the current path is a public path
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

    // Get the token from the cookies
    // Adjust the cookie name 'token' if your API uses a different name (e.g., 'jwt', 'session_id')
    const token = request.cookies.get("token")?.value;

    // Redirect logic
    if (!token && !isPublicPath) {
        // If user is not authenticated and trying to access a protected route
        // Redirect to login page
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        // Optional: Add the original URL as a query parameter to redirect back after login
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
    }

    if (token && isPublicPath) {
        // If user is authenticated and trying to access a public route (like login)
        // Redirect to dashboard
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files (images, etc)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
