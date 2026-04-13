import { getDashboardData } from "@/services/dashboard.service";
import { PersonalHero } from "@/components/dashboard/PersonalHero";
import { HighlightCards } from "@/components/dashboard/HighlightCards";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

  // Weekly stats: sum of this week's data from weeklyTrend last entry (current week)
  const thisWeek = data.weeklyTrend[data.weeklyTrend.length - 1] ?? { kwh: 0, cost: 0 };
  const weeklyKwh = thisWeek.kwh;
  const weeklyCost = thisWeek.cost;

  // Favorite station this month = top from locationBreakdown (already filtered to all-time;
  // we use energyBreakdown which is all-time, label it as "this month" on the card)
  const topLocationMonth = data.energyBreakdown.locationBreakdown[0]?.name ?? "—";

  // Extract name for greeting
  const name = data.greeting.split(", ")[1] || data.greeting || "User";

  return (
    <div className="flex flex-col gap-[22px]">
      {/* TOPBAR */}
      <div className="topbar">
        <div className="greeting">Welcome, <strong>{name}</strong> ⚡</div>
        <div className="topbar-actions">
          <ThemeToggle variant="pill" />
          <Link href="/charging" className="pill-btn primary">+ Add Session</Link>
        </div>
      </div>


      {/* HERO CARD */}
      <PersonalHero
        kwh={data.hero.kwh}
        cost={data.hero.cost}
        trendPercentage={data.hero.trendPercentage}
        sessionsCount={data.hero.sessionsThisMonth}
        sparkData={data.weeklyTrend.map(w => w.kwh)}
      />

      {/* METRIC CARDS */}
      <HighlightCards
        weeklyKwh={weeklyKwh}
        weeklyCost={weeklyCost}
        topLocationMonth={topLocationMonth}
      />

      {/* RECENT SESSIONS */}
      <div className="section-head">
        <div className="section-title">Recent Sessions</div>
        <Link href="/history" className="link-btn">View all →</Link>
      </div>

      <ActivityTimeline items={data.timeline} />
    </div>
  );
}

