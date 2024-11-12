import { useCallback, useState } from "react";

export function useOpen() {
  const [open, setOpen] = useState(true);
  const onClose = useCallback(() => setOpen(false), []);
  const onOpen = useCallback(() => setOpen(true), []);

  return {
    open,
    onClose,
    onOpen,
  };
}
