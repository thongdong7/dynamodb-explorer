import { useCallback, useState } from "react";

export interface OpenHook {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export function useOpen(): OpenHook {
  const [open, setOpen] = useState(false);
  const onClose = useCallback(() => setOpen(false), []);
  const onOpen = useCallback(() => setOpen(true), []);

  return {
    open,
    onClose,
    onOpen,
  };
}
