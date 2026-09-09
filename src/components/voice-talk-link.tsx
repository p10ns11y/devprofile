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

/** Hire Direct-channels row — always linked; /call itself owns the enable gate. */
export function HireVoiceTalkChannel() {
  return (
    <Link href="/call" className="hire-phi__channel" data-lcv="voice-talk-link">
      <span className="hire-phi__channel-icon" aria-hidden="true">
        <AudioLines className="size-4" />
      </span>
      <span className="hire-phi__channel-text">
        <span className="hire-phi__channel-label">Talk</span>
        <span className="hire-phi__channel-value">Voice reception — same answers as Q&amp;A</span>
      </span>
    </Link>
  );
}

/** Legacy contact-section channel row — gated like hero Talk links. */
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
