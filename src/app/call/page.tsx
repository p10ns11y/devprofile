import { CallPageClient } from "@/components/call-page-client";
import { isVoiceReceiveEnabled } from "@/lib/voice/config/resolve-voice-receive";

export const metadata = {
  title: "Talk — Voice reception",
  description:
    "Speak with the portfolio receptionist — grounded answers from the same corpus as Q&A.",
};

export default function CallPage() {
  // ENABLE_VOICE_RECEIVE is server-only; evaluate here and pass into the client shell.
  const enabled = isVoiceReceiveEnabled();

  return <CallPageClient enabled={enabled} />;
}
