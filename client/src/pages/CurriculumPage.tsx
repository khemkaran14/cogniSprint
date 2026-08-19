import { Seo } from "@/components/shared/Seo";
import { Container, SectionHeading } from "@/components/ui/Container";
import { CurriculumBrowser } from "@/components/course/CurriculumBrowser";
import { LoadingState, ErrorState } from "@/components/shared/QueryStates";
import { useContentAvailability, useCurriculum } from "@/lib/queries";

export default function CurriculumPage() {
  const { data: modules, isLoading, isError, refetch } = useCurriculum();
  const availability = useContentAvailability();
  const publishedLessons = availability.data?.published.lessons;
  const publishedAssessments = availability.data?.published.assessments;

  return (
    <>
      <Seo
        title="Curriculum Roadmap — Published and Planned Modules"
        description={`Review CogniSprint's curriculum roadmap. ${publishedLessons ?? "Verified"} foundation lessons are currently published; other module counts are plans, not delivered content.`}
        path="/curriculum"
      />
      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Curriculum roadmap"
            title="Explore the proposed module structure"
            description={`${publishedLessons ?? "Verified"} lessons and ${publishedAssessments ?? "verified"} assessment baselines are currently published. All other figures below are roadmap targets—not available purchase content. Enrollment is ${availability.data?.enrollmentOpen ? "open" : "closed"}.`}
            align="left"
          />
          <div className="mt-12">
            {isLoading ? <LoadingState label="Loading curriculum…" /> : null}
            {isError ? <ErrorState onRetry={() => refetch()} /> : null}
            {modules ? <CurriculumBrowser modules={modules} /> : null}
          </div>
        </Container>
      </section>
    </>
  );
}
