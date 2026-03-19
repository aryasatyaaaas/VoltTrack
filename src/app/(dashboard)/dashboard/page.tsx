import { getDashboardData } from "@/services/dashboard.service";
import { PersonalHero } from "@/components/dashboard/PersonalHero";
import { HighlightCards } from "@/components/dashboard/HighlightCards";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

  const topLocation = data.energyBreakdown.locationBreakdown[0]?.name ?? "—";

  return (
    <div className="space-y-10">
      {/* Hero Ring */}
      <section>
        <PersonalHero
          greeting={data.greeting}
          kwh={data.hero.kwh}
          cost={data.hero.cost}
          trendPercentage={data.hero.trendPercentage}
        />
      </section>

      {/* This Week's Highlights */}
      <section>
        <HighlightCards
          kwh={data.hero.kwh}
          cost={data.hero.cost}
          topLocation={topLocation}
        />
      </section>

      {/* Recent Sessions */}
      <section>
        <ActivityTimeline items={data.timeline} />
      </section>
    </div>
  );
}
