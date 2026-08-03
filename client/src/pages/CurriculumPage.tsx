import { Seo } from "@/components/shared/Seo";
import { Container, SectionHeading } from "@/components/ui/Container";
import { CurriculumBrowser } from "@/components/course/CurriculumBrowser";
import { LoadingState, ErrorState } from "@/components/shared/QueryStates";
import { useCurriculum } from "@/lib/queries";

export default function CurriculumPage() {
  const { data: modules, isLoading, isError, refetch } = useCurriculum();

  return (
    <>
      <Seo
        title="Curriculum — Browse Every Brain Training Module"
        description="Search and filter the complete CogniSprint curriculum by skill: mental math, memory, logic, focus, observation and critical thinking."
        path="/curriculum"
      />
      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Curriculum"
            title="Every module, searchable and filterable by skill"
            description="Filter by mental math, memory, logic, focus, observation or critical thinking to see exactly what each module covers before you enrol."
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
