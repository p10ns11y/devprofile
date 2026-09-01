import cvdata from "@/data/cvdata.json";
import { landingInvite } from "@/data/landing-invite";

export function CredentialsPullquote() {
  return (
    <figure className="credentials-pullquote">
      <blockquote>
        <p>{landingInvite.credentialsQuote}</p>
      </blockquote>
      <figcaption>
        — <cite>{cvdata.name}</cite>
      </figcaption>
    </figure>
  );
}
