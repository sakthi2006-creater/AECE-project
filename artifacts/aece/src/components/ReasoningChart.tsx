import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from "recharts";
import { type EthicalFrameworkScores } from "@workspace/api-client-react";
import { getDecisionColors } from "@/lib/utils";

interface ReasoningChartProps {
  scores: EthicalFrameworkScores;
  decision?: string;
}

export function ReasoningChart({ scores, decision }: ReasoningChartProps) {
  const colors = getDecisionColors(decision);
  
  const data = [
    { subject: 'Utilitarian', A: scores.utilitarian, fullMark: 100 },
    { subject: 'Deontological', A: scores.deontological, fullMark: 100 },
    { subject: 'Virtue', A: scores.virtue, fullMark: 100 },
    { subject: 'Care', A: scores.care, fullMark: 100 },
    { subject: 'Context', A: scores.context, fullMark: 100 },
  ];

  return (
    <div className="w-full h-64 md:h-80 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontFamily: 'var(--font-mono)', textAnchor: 'middle' }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Score"
            dataKey="A"
            stroke={colors.hex}
            fill={colors.hex}
            fillOpacity={0.3}
            isAnimationActive={true}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: `1px solid ${colors.hex}`, borderRadius: '8px', color: '#fff', fontFamily: 'var(--font-mono)' }}
            itemStyle={{ color: colors.hex }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
