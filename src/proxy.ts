import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware proxy previously enforced auth by checking for an httpOnly cookie. Since
 * tokens now travel via Authorization headers, we can't inspect them in middleware.
 * Leave the hook in place for future enhancements but allow all requests to proceed.
 */
export function proxy(_request: NextRequest) {
    void _request;
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
