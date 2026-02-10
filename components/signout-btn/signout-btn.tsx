"use client";

import { signOut } from "next-auth/react";

import { Button } from "../ui/button";

export function SignOutBtn() {
  return (
    <Button onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</Button>
  );
}
