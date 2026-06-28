import { NextRequest, NextResponse } from "next/server";
import { getSafeCallbackPath, SIGN_IN_PATH } from ".";
import { auth } from "@/lib/auth";


function redirectToSignIn(request: NextRequest, pathname: string) {
  const signInUrl = new URL(SIGN_IN_PATH, request.url);
  // Include query string so filters/search params survive the round-trip through sign-in.
  signInUrl.searchParams.set(
    "callbackUrl",
    `${pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(signInUrl);
}

function getPostAuthRedirectPath(request: NextRequest): string {
  const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
  return getSafeCallbackPath(callbackUrl);
}

export async function handleAuthProxy(req:NextRequest){
    const {pathname} = req.nextUrl
    if(pathname === "/"){
        return NextResponse.next()
    }
    const session = await auth.api.getSession({
        headers: req.headers
    })

    if(pathname === SIGN_IN_PATH){
        if(session){
            const redirectPath = getPostAuthRedirectPath(req)
            return NextResponse.redirect(new URL(redirectPath,req.url))
        }
        return NextResponse.next()
    }
    if(!session){
        return redirectToSignIn(req,pathname)
    }
return NextResponse.next()
}