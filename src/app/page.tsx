import { Landing } from "@components/Landing";
import { landingChoices } from "@data/landing";

/** Homepage: pick the arcade browser or the classic grid. */
export default function HomePage() {
  return (
    <main>
      <Landing choices={landingChoices} />
    </main>
  );
}
