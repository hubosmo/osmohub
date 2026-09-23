"use client";

import { useTransition, useEffect } from "react";
import { toast } from "sonner";
import { useUnsavedChanges } from "@/stores/unsaved-changes";

type Props = {
  id?: string;
  action: (formData: FormData) => Promise<void>;
  className?: string;
  children: React.ReactNode;
  successMessage?: string;
};

export function AdminSaveForm({
  id,
  action,
  className,
  children,
  successMessage = "¡Cambios guardados!",
}: Props) {
  const [isPending, startTransition] = useTransition();
  const { isDirty, setDirty } = useUnsavedChanges();

  // Register beforeunload when dirty (browser close / tab close / refresh)
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Clear dirty when unmounting (navigation completed after guard allowed it)
  useEffect(() => {
    return () => setDirty(false);
  }, [setDirty]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await action(formData);
        setDirty(false);
        toast.success(successMessage);
      } catch {
        toast.error("Error al guardar. Intenta de nuevo.");
      }
    });
  }

  return (
    <form
      id={id}
      className={className}
      onSubmit={handleSubmit}
      onChange={() => setDirty(true)}
      data-pending={isPending || undefined}
      data-dirty={isDirty || undefined}
    >
      {children}
    </form>
  );
}
