import { useState } from 'react';

export function useSheet() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);

  function openSheet() {
    setSession((s) => s + 1);
    setOpen(true);
  }
  function closeSheet() {
    setOpen(false);
  }

  return { open, session, openSheet, closeSheet };
}
