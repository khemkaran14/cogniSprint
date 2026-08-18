import { Seo } from "@/components/shared/Seo";
import { HeroSection } from "@/components/marketing/home/HeroSection";
import { TrustFactsSection } from "@/components/marketing/home/TrustFactsSection";
import { ProblemSolutionSection } from "@/components/marketing/home/ProblemSolutionSection";
import { DailyRoutine } from "@/components/marketing/DailyRoutine";
import { SkillGrid } from "@/components/marketing/SkillGrid";
import { CourseTimeline } from "@/components/marketing/CourseTimeline";
import { SampleLessonPreview } from "@/components/marketing/SampleLessonPreview";
import { AudienceSection } from "@/components/marketing/AudienceSection";
import { BenefitsSection } from "@/components/marketing/BenefitsSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { GamificationPreview } from "@/components/marketing/GamificationPreview";
import { BonusesSection } from "@/components/marketing/BonusesSection";
import { HomePricingSection } from "@/components/marketing/home/PricingSection";
import { FaqSection } from "@/components/marketing/FaqSection";
import { FinalCta } from "@/components/marketing/FinalCta";
import { siteConfig } from "@/config/seo";
import { useContentAvailability } from "@/lib/queries";

export default function HomePage() {
  const availability = useContentAvailability();
  return (
    <>
      <Seo title={siteConfig.title} description={siteConfig.description} path="/" />
      <HeroSection />
      <TrustFactsSection availability={availability.data} />
      <ProblemSolutionSection />
      <DailyRoutine />
      <SkillGrid />
      <CourseTimeline availability={availability.data} />
      <SampleLessonPreview />
      <AudienceSection />
      <BenefitsSection />
      <HowItWorksSection />
      <GamificationPreview />
      <BonusesSection />
      <HomePricingSection />
      <FaqSection limit={8} />
      <FinalCta />
    </>
  );
}
