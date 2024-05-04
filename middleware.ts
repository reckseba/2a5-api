import type { NextRequest } from "next/server";
 
// This function can be marked `async` if using `await` inside
export function middleware(req: NextRequest) {

    if (req.nextUrl.pathname.match("/api/urlShort/*") || req.nextUrl.pathname.match("/api/urlLong/new")) {
        // only these routes are unauthenticated ok
        return;
    }


    const authHeaderValue = req.headers.get("authorization");

    if (!authHeaderValue) {
        return Response.json(
            { message: "No auth token provided." },
            { status: 401 }
        );
    }

    const token = authHeaderValue.split("Bearer ").at(1);

    // replace ADMIN_AUTH_TOKEN with your expected token
    if (token !== process.env.ADMIN_TOKEN) {        
        return Response.json(
            { message: "Invalid auth token." },
            { status: 401 }
        );
    }

    return;
}
 
// See "Matching Paths" below to learn more
export const config = {
    matcher: "/api/:path*",
};