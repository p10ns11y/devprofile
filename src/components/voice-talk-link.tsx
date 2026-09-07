import { AudioLines } from "lucide-react";
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

/** Contact-section channel row — gated like nav and hero Talk links. */
export function VoiceTalkContactChannel() {
  if (!isVoiceReceivePublic()) return null;

  return (
    <Link href="/call" className="contact-channel contact-channel--talk" data-lcv="voice-talk-link">
      <span className="contact-channel__icon" aria-hidden="true">
        <AudioLines className="w-5 h-5" />
      </span>
      <span>
        <span className="contact-channel__label">Talk</span>
        <span className="contact-channel__value">Voice reception — same answers as Q&amp;A</span>
      </span>
    </Link>
  );
}
