import { motion } from "framer-motion";
import { getDecisionColors } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  decision?: string;
  size?: number;
  strokeWidth?: number;
}

export function ScoreGauge({ score, decision, size = 200, strokeWidth = 12 }: ScoreGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const safeScore = Math.max(0, Math.min(100, score || 0));
  const offset = circumference - (safeScore / 100) * circumference;
  
  const colors = getDecisionColors(decision || 'CONDITIONAL');
  const isBlocked = decision === 'BLOCKED';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background glowing blurred circle */}
      <div 
        className={`absolute inset-0 rounded-full blur-3xl opacity-20 ${isBlocked ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: colors.hex }}
      />
      
      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-secondary opacity-50"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.hex}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${colors.hex})` }}
          className={isBlocked ? "animate-pulse" : ""}
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-5xl font-mono font-bold tracking-tighter"
          style={{ color: colors.hex, textShadow: `0 0 15px ${colors.hex}` }}
        >
          {safeScore.toFixed(0)}
        </motion.span>
        <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1 font-display">
          Ethical Score
        </span>
        {decision && (
          <span className={`text-sm font-bold uppercase tracking-wider mt-2 ${colors.text} ${isBlocked ? 'animate-pulse' : ''}`}>
            {decision}
          </span>
        )}
      </div>
    </div>
  );
}
