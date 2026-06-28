import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient();

const signInWithGoogle = async () => {
  const data = await authClient.signIn.social({
    provider: "google",
    callbackURL: "/dashboard"
  });
};

const signInWithGithub = async () => {
  const data = await authClient.signIn.social({
    provider: "github",
    callbackURL: "/dashboard"
  })
}



