import React from 'react'
import type { Metadata } from 'next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSet,
} from "@/components/ui/field";
import { GithubSignInForm } from '@/features/auth/components/github-sign-in-form';

export const metadata: Metadata = {
  title: "Sign in — ShipFlow AI",
  description: "Sign in to ShipFlow AI with your GitHub account.",
};

type SignInPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

const SignInPage = async ({ searchParams }: SignInPageProps) => {
  const { callbackUrl } = await searchParams;
  return (
    <Card className="gena-card border border-border/80 hover:glow-amber shadow-2xl relative overflow-hidden p-3 bg-card/65 backdrop-blur-xl">
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <CardHeader className="items-center text-center pb-4">
        {/* Typographic AI Brand Icon */}
        <div className="mb-5 flex justify-center pt-2">
          <div className="size-11 rounded-lg bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="font-display font-bold text-base text-primary-foreground">SF</span>
          </div>
        </div>
        <CardTitle className="text-sm font-semibold text-foreground">Welcome back</CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          Sign in to manage your feature requests and code reviews.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldSet>
          <FieldGroup className="gap-3">
            <Field>
              <GithubSignInForm callbackUrl={callbackUrl} />
            </Field>
            <Field>
              <FieldDescription className="text-center text-[10px] text-muted-foreground/60 leading-relaxed mt-2">
                We only request the permissions needed to identify your
                account. You can revoke access anytime.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </FieldSet>
      </CardContent>
    </Card>
  )
}

export default SignInPage