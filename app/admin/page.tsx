import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="mb-4 text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-neutral-600">
        Welcome,
        {" "}
        {session.user.name}
        . Use the navigation to manage your photos.
      </p>
    </div>
  );
}
