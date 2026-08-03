import { Seo } from "@/components/shared/Seo";
import { ChallengeFlow } from "@/components/challenge/ChallengeFlow";

export default function SampleChallengePage() {
  return (
    <>
      <Seo
        title="Free Brain Skills Challenge — Try CogniSprint"
        description="Try a free, interactive 5-minute brain challenge covering mental math, memory, pattern recognition, observation and critical thinking. No signup required."
        path="/sample-challenge"
      />
      <ChallengeFlow />
    </>
  );
}
