"use client";

import { ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import useScreenRecorder from "@/hooks/use-screen-recorder";
import ScreenRecorderPanel from "@/components/screen-recorder/screen-recorder-pannel";

interface ScreenRecorderDialogProps {
  /** Whatever you want to open the recorder — a Button, an icon, anything. */
  children: ReactNode;
  className?: string;
}

export default function ScreenRecorderDialog({
  children,
  className,
}: ScreenRecorderDialogProps) {
  // Owned here, not inside the panel, so the capture survives the dialog closing.
  const recorder = useScreenRecorder();
  const [open, setOpen] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Block accidental close while recording — closing would hide the
        // preview while the capture keeps running unseen in the background.
        if (!next && recorder.recording) return;
        setOpen(next);
      }}
    >
      <DialogTrigger >{children}</DialogTrigger>

      <DialogContent
        className={cn(
          "max-w-md border-none bg-transparent p-0 shadow-none [&>button]:text-zinc-400 [&>button]:hover:text-zinc-200",
          className
        )}
    
      >
        <DialogTitle className="sr-only">Screen recorder</DialogTitle>
        <DialogDescription className="sr-only">
          Start or stop a screen recording and preview it live.
        </DialogDescription>

        <ScreenRecorderPanel {...recorder} />
      </DialogContent>
    </Dialog>
  );
}