import { CallPageClient } from "@/components/call-page-client";
import { isVoiceReceiveEnabled } from "@/lib/voice/config/resolve-voice-receive";

export { generateMetadata } from "./social-metadata";

export default function CallPage() {
  // ENABLE_VOICE_RECEIVE is server-only; evaluate here and pass into the client shell.
  const enabled = isVoiceReceiveEnabled();

  return <CallPageClient enabled={enabled} />;
}
