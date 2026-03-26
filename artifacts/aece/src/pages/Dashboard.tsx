import { useGetSystemStatus, useGetHistory } from "@workspace/api-client-react";
import { CyberCard } from "@/components/ui/CyberCard";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { getDecisionColors } from "@/lib/utils";
import { Activity, CheckCircle, AlertTriangle, ShieldX, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function Dashboard() {
  const { data: status, isLoading: isStatusLoading } = useGetSystemStatus();
  const { data: history, isLoading: isHistoryLoading } = useGetHistory({ limit: 4 });

  if (isStatusLoading || isHistoryLoading) {
    return <div className="flex items-center justify-center h-full"><Activity className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!status) return <div>Failed to load system status.</div>;

  // Determine overall health decision based on average score roughly
  let avgDecision = 'CONDITIONAL';
  if (status.averageScore >= 80) avgDecision = 'APPROVED';
  else if (status.averageScore < 20) avgDecision = 'BLOCKED';
  else if (status.averageScore < 50) avgDecision = 'FLAGGED';

  const stats = [
    { label: "Approved", value: status.approvedCount, icon: CheckCircle, color: "text-aece-approved" },
    { label: "Conditional", value: status.conditionalCount, icon: Clock, color: "text-aece-conditional" },
    { label: "Flagged", value: status.flaggedCount, icon: AlertTriangle, color: "text-aece-flagged" },
    { label: "Blocked", value: status.blockedCount, icon: ShieldX, color: "text-aece-blocked" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      <header className="mb-8">
        <h1 className="text-4xl font-display font-bold text-white mb-2">System Overview</h1>
        <p className="text-muted-foreground font-mono">Real-time telemetry and decision metrics.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Big Gauge */}
        <CyberCard className="lg:col-span-1 flex flex-col items-center justify-center min-h-[350px]" glow>
          <ScoreGauge score={status.averageScore} decision={avgDecision} size={240} />
          <div className="mt-8 flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">Total Processed:</span>
            <span className="font-mono text-xl text-white font-bold">{status.totalDecisions}</span>
          </div>
        </CyberCard>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {stats.map((stat, i) => (
            <CyberCard key={i} className="flex flex-col justify-center gap-4">
              <div className="flex items-center justify-between">
                <span className="font-display uppercase tracking-widest text-muted-foreground text-sm">{stat.label}</span>
                <stat.icon className={`w-6 h-6 ${stat.color} opacity-80`} />
              </div>
              <div className={`text-5xl font-mono font-bold ${stat.color} drop-shadow-[0_0_8px_currentColor]`}>
                {stat.value}
              </div>
            </CyberCard>
          ))}
        </div>
      </div>

      {/* Recent Decisions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" /> Recent Evaluations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {history?.decisions?.map((decision) => {
            const colors = getDecisionColors(decision.decision);
            return (
              <CyberCard key={decision.id} className="flex flex-col gap-3 group hover:border-white/20 transition-colors">
                <div className="flex justify-between items-start">
                  <span className={`px-2 py-1 text-[10px] font-mono uppercase tracking-widest rounded-sm ${colors.bg} ${colors.text} border ${colors.border}`}>
                    {decision.decision}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {formatDistanceToNow(new Date(decision.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-end justify-between mt-2">
                  <span className="text-3xl font-mono font-bold text-white">{Math.round(decision.ethicalScore)}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2" title={decision.scenario}>
                  {decision.scenario}
                </p>
              </CyberCard>
            );
          })}
          {(!history?.decisions || history.decisions.length === 0) && (
            <div className="col-span-full py-12 text-center text-muted-foreground font-mono glass-panel rounded-2xl border border-white/5">
              No recent decisions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
