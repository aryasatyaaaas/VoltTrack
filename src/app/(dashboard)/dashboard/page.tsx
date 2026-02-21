import { getDashboardData } from "@/services/dashboard.service";
import { PersonalHero } from "@/components/dashboard/PersonalHero";
import { StoryList } from "@/components/dashboard/StoryList";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { EnergyBreakdown } from "@/components/dashboard/EnergyBreakdown";

import { Predictions } from "@/components/dashboard/Predictions";

import { Header } from "@/components/layout/Header";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <>
      <Header title="Home" subtitle="Your smart energy assistant." />

      <div className="relative mx-auto mt-4 max-w-3xl space-y-10 px-4 pb-24 md:mt-8 md:px-0 md:pb-12">
        {/* Background Ambience */}
        <div className="pointer-events-none fixed inset-0 -z-10 bg-black" />



        {/* Hero Section */}
        <section>
          <PersonalHero
            greeting={data.greeting}
            kwh={data.hero.kwh}
            insight={data.hero.insightText}
            trendPercentage={data.hero.trendPercentage}
          />
        </section>

        {/* Smart Insights */}
        <section>
          <StoryList stories={data.stories} />
        </section>

        {/* Predictions */}
        <section>
          <h3 className="mb-4 px-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Predictions
          </h3>
          <Predictions predictions={data.predictions} />
        </section>

        {/* Energy Breakdown */}
        <section>
          <h3 className="mb-4 px-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Energy Breakdown
          </h3>
          <EnergyBreakdown data={data.energyBreakdown} />
        </section>



        {/* Activity Trend */}
        <section>
          <TrendChart data={data.weeklyTrend} />
        </section>

        {/* Recent Activity */}
        <section>
          <ActivityTimeline items={data.timeline} />
        </section>

        {/* Footer */}
        <div className="pb-8 text-center text-xs text-zinc-700">
          <p>Your smart energy assistant — updating in real-time.</p>
        </div>
      </div>
    </>
  );
}
