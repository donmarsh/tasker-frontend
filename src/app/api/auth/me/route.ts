import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    // Get the token from cookies (server-side can access httpOnly cookies)
    const token = request.cookies.get('access_token')?.value;

    if (!token) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    try {
        // Decode the JWT token
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            Buffer.from(base64, 'base64')
                .toString('utf-8')
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        const decoded = JSON.parse(jsonPayload);

        return NextResponse.json({
            authenticated: true,
            user_id: decoded.user_id,
            email: decoded.email,
            roles: decoded.roles || [],
        });
    } catch (error) {
        console.error('Failed to decode token:', error);
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
}
