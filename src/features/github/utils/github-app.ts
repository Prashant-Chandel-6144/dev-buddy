import { App } from "octokit";


export function getGithubApp() {
  return new App({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    webhooks: {
      secret: process.env.GITHUB_WEBHOOK_SECRET!,
    },
  });
}

export function getGithubInstallUrl(userId: string) {
  const url = new URL(`https://github.com/apps/the-shipmate/installations/new`);
  // `state` round-trips through GitHub so we can link the installation to this user.
  url.searchParams.set("state", userId);
  return url.toString();
}
