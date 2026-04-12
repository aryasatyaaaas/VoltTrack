import { getDashboardData } from "@/services/dashboard.service";
import { PersonalHero } from "@/components/dashboard/PersonalHero";
import { HighlightCards } from "@/components/dashboard/HighlightCards";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const topLocation = data.energyBreakdown.locationBreakdown[0]?.name ?? "—";
  
  // Extract name for greeting
  const name = data.greeting.split(", ")[1] || data.greeting || "User";

  return (
    <div className="flex flex-col gap-[22px]">
      {/* TOPBAR */}
      <div className="topbar">
        <div className="greeting">Welcome, <strong>{name}</strong> ⚡</div>
        <div className="topbar-actions">
          <button className="pill-btn">Apr 2026</button>
          <Link href="/charging" className="pill-btn primary">+ Add Session</Link>
        </div>
      </div>

      {/* HERO CARD */}
      <PersonalHero
        kwh={data.hero.kwh}
        cost={data.hero.cost}
        trendPercentage={data.hero.trendPercentage}
        sessionsCount={data.hero.sessionsThisWeek}
        sparkData={data.weeklyTrend.map(w => w.kwh)}
      />

      {/* METRIC CARDS */}
      <HighlightCards
        kwh={data.hero.kwh}
        cost={data.hero.cost}
        topLocation={topLocation}
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

