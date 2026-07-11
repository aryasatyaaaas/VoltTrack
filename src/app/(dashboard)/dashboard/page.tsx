import { getDashboardData } from "@/services/dashboard.service";
import { PersonalHero } from "@/components/dashboard/PersonalHero";
import { HighlightCards } from "@/components/dashboard/HighlightCards";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

  const currency = data.currency;

  // Weekly stats: sum of this week's data from weeklyTrend last entry (current week)
  const thisWeek = data.weeklyTrend[data.weeklyTrend.length - 1] ?? { kwh: 0, cost: 0 };
  const weeklyKwh = thisWeek.kwh;
  const weeklyCost = thisWeek.cost;

  // Favorite station = most visited location this calendar month
  const topLocationMonth = data.energyBreakdown.topLocationThisMonth ?? "—";

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
        currency={currency}
      />

      {/* METRIC CARDS */}
      <HighlightCards
        weeklyKwh={weeklyKwh}
        weeklyCost={weeklyCost}
        topLocationMonth={topLocationMonth}
        currency={currency}
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

