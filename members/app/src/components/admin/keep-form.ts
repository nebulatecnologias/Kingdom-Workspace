"use client";

import { startTransition, type FormEvent } from "react";

/**
 * Submits a form to a useActionState action without React's automatic form reset,
 * so what the admin typed stays in place when the server answers with a validation error.
 */
export function keepValues(action: (formData: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(() => action(formData));
  };
}
