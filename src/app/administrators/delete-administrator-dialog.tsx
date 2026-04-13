"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/app/components/button";
import ErrorAlert from "@/app/components/error-alert";
import { UsersService } from "@/api/userApi";
import { clientAuthProvider } from "@/lib/authProvider";
import { User } from "@/types/user";
import { parseErrorMessage } from "@/types/errors";

interface DeleteAdministratorDialogProps {
  readonly administrator: User;
  readonly onSuccess: () => void;
  readonly onCancel: () => void;
}

export default function DeleteAdministratorDialog({
  administrator,
  onSuccess,
  onCancel,
}: DeleteAdministratorDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const titleId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const service = new UsersService(clientAuthProvider);

  // Lock body scroll and focus Cancel button on mount; restore on unmount
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isDeleting) {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDeleting, onCancel]);

  // Trap focus inside the dialog panel
  function handleKeyDownPanel(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;

    const focusable = event.currentTarget.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await service.deleteUser(administrator.username);
      onSuccess();
    } catch (e) {
      setErrorMessage(parseErrorMessage(e));
      setIsDeleting(false);
    }
  }

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      aria-hidden="false"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onCancel();
      }}
    >
      {/* Dialog panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={isDeleting}
        className="relative w-full max-w-md border border-border bg-card px-6 py-6 shadow-lg sm:px-8 sm:py-8"
        onKeyDown={handleKeyDownPanel}
      >
        <h2
          id={titleId}
          className="text-lg font-semibold tracking-[-0.03em] text-foreground"
        >
          Delete administrator
        </h2>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-foreground">
            {administrator.username}
          </span>
          {administrator.email && (
            <>
              {" "}
              (<span className="text-foreground">{administrator.email}</span>)
            </>
          )}
          ? This action cannot be undone.
        </p>

        {errorMessage && (
          <div className="mt-4">
            <ErrorAlert message={errorMessage} />
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            ref={cancelButtonRef}
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? "Deleting…" : "Delete administrator"}
          </Button>
        </div>
      </div>
    </div>
  );
}
