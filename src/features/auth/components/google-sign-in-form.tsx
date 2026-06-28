"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useFormStatus } from "react-dom";
import { signInWithGoogle } from "../actions";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="currentColor">
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    </svg>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  let buttonLabel = "Continue with Google";
  let buttonIcon = <GoogleIcon />;

  if (pending) {
    buttonLabel = "Redirecting to Google…";
    buttonIcon = <Spinner className="size-4" />;
  }
  return (
    <Button type="submit" variant="outline" className={"w-full"} size={"lg"} disabled={pending}>
      {buttonIcon}
      {buttonLabel}
    </Button>
  );
}

type GoogleSignInFormProps = {
  /** Optional post-login redirect path. */
  callbackUrl?: string;
};

export function GoogleSignInForm({ callbackUrl }: GoogleSignInFormProps) {
  return (
    <form action={signInWithGoogle} className="w-full">
      {callbackUrl ? (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      ) : null}
      <SubmitButton />
    </form>
  )
}
size = "lg"
disabled = { pending }
onClick = { handleLogin }
  >
  { pending?<Spinner className = "size-4" /> : <GoogleIcon />}
{ pending ? "Redirecting to Google…" : "Continue with Google" }
      </Button >
    )
}
