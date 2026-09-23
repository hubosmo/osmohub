"use client";

import { useUser } from "@/components/providers/UserProvider";

export function DashboardWelcome() {
  const { userName } = useUser();

  return (
    <h1 className="text-3xl font-light text-center" style={{ color: "var(--text-primary)" }}>
      ¡Bienvenido de nuevo,{" "}
      <span className="font-bold">{userName}</span>!
    </h1>
  );
}
