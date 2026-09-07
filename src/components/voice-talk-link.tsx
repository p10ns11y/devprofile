import Link from "next/link";
import type { ReactNode } from "react";
import { isVoiceReceivePublic } from "@/lib/voice/config/resolve-voice-receive";

type VoiceTalkLinkProps = {
  className?: string;
  children?: ReactNode;
};

/** Shown only when NEXT_PUBLIC_ENABLE_VOICE_RECEIVE=true at build time. */
export function VoiceTalkLink({ className, children = "Talk instead" }: VoiceTalkLinkProps) {
  if (!isVoiceReceivePublic()) return null;

  return (
    <Link href="/call" className={className} data-lcv="voice-talk-link">
      {children}
    </Link>
  );
}
