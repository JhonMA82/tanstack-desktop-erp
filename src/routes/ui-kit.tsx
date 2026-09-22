import { createFileRoute } from "@tanstack/react-router";
import { BadgesSection } from "@/components/uikit/BadgesSection";
import { ButtonsSection } from "@/components/uikit/ButtonsSection";
import { ComplexFormSection } from "@/components/uikit/ComplexFormSection";
import { FeedbackSection } from "@/components/uikit/FeedbackSection";
import { IconsSection } from "@/components/uikit/IconsSection";
import { MetricCardsSection } from "@/components/uikit/MetricCardsSection";
import { MetricsSection } from "@/components/uikit/MetricsSection";
import { ModalsSection } from "@/components/uikit/ModalsSection";
import { PerformanceOverviewSection } from "@/components/uikit/PerformanceOverviewSection";
import { SimpleFormSection } from "@/components/uikit/SimpleFormSection";
import { SubscriberOverviewSection } from "@/components/uikit/SubscriberOverviewSection";
import { TableSection } from "@/components/uikit/TableSection";
import { TabsSection } from "@/components/uikit/TabsSection";
import { TokensSection } from "@/components/uikit/TokensSection";

export const Route = createFileRoute("/ui-kit")({
  component: UiKitPage,
});

/** Reusable-widgets gallery: every primitive of the design system in one page. */
function UiKitPage() {
  return (
    <div className="flex flex-col gap-2 p-2">
      <TokensSection />
      <div className="grid grid-cols-1 items-start gap-2 xl:grid-cols-2">
        <ButtonsSection />
        <BadgesSection />
      </div>
      <IconsSection />
      <MetricCardsSection />
      <PerformanceOverviewSection />
      <SubscriberOverviewSection />
      <div className="grid grid-cols-1 items-start gap-2 2xl:grid-cols-2">
        <SimpleFormSection />
        <ComplexFormSection />
      </div>
      <div className="grid grid-cols-1 items-start gap-2 xl:grid-cols-2">
        <ModalsSection />
        <div className="flex flex-col gap-2">
          <FeedbackSection />
          <TabsSection />
        </div>
      </div>
      <MetricsSection />
      <TableSection />
    </div>
  );
}
