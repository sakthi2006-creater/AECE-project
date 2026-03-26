import { useState } from "react";
import { useGetHistory, useSubmitFeedback, type GetHistoryDecision } from "@workspace/api-client-react";
import { CyberCard } from "@/components/ui/CyberCard";
import { getDecisionColors, cn } from "@/lib/utils";
import { format } from "date-fns";
import { Search, ThumbsUp, ThumbsDown, Filter, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function History() {
  const [filter, setFilter] = useState<GetHistoryDecision | "ALL">("ALL");
  const { data, isLoading } = useGetHistory({ limit: 50, decision: filter === "ALL" ? undefined : filter });
  const feedbackMutation = useSubmitFeedback();
  const [feedbackSuccess, setFeedbackSuccess] = useState<number | null>(null);

  const handleFeedback = (decisionId: number, type: 'approve' | 'reject') => {
    feedbackMutation.mutate(
      { data: { decisionId, userFeedback: type } },
      { onSuccess: () => {
          setFeedbackSuccess(decisionId);
          setTimeout(() => setFeedbackSuccess(null), 2000);
        }
      }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Audit Log</h1>
          <p className="text-muted-foreground font-mono">Immutable record of all ethical decisions made by the engine.</p>
        </div>
        
        <div className="flex gap-2 p-1 bg-black/40 border border-white/10 rounded-xl overflow-x-auto">
          {["ALL", "APPROVED", "CONDITIONAL", "FLAGGED", "BLOCKED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={cn(
                "px-4 py-2 rounded-lg font-mono text-xs tracking-widest uppercase whitespace-nowrap transition-colors",
                filter === f ? "bg-primary text-black font-bold shadow-[0_0_10px_rgba(0,212,255,0.4)]" : "text-muted-foreground hover:text-white"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <CyberCard className="p-0 overflow-hidden border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-black/60 text-muted-foreground font-mono text-xs uppercase tracking-widest border-b border-white/10">
              <tr>
                <th className="px-6 py-4">ID / Time</th>
                <th className="px-6 py-4">Scenario</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Decision</th>
                <th className="px-6 py-4 text-right">Human Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                    <span className="font-mono text-muted-foreground">Retrieving secure logs...</span>
                  </td>
                </tr>
              ) : data?.decisions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center font-mono text-muted-foreground">
                    No records match the current filter.
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {data?.decisions.map((item) => {
                    const colors = getDecisionColors(item.decision);
                    const isOverridden = item.isOverridden;
                    
                    return (
                      <motion.tr 
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-mono text-white">#{item.id.toString().padStart(4, '0')}</div>
                          <div className="text-xs text-muted-foreground mt-1">{format(new Date(item.timestamp), 'MMM dd HH:mm')}</div>
                        </td>
                        <td className="px-6 py-4 max-w-md">
                          <p className="truncate text-gray-300" title={item.scenario}>{item.scenario}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-mono text-lg font-bold text-white">{Math.round(item.ethicalScore)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={cn("px-2 py-1 text-[10px] font-mono uppercase tracking-widest rounded-sm border", colors.bg, colors.text, colors.border)}>
                              {item.decision}
                            </span>
                            {isOverridden && (
                              <span className="text-[10px] text-accent font-mono bg-accent/10 px-1 rounded border border-accent/20">MANUAL OVERRIDE</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {feedbackSuccess === item.id ? (
                            <span className="inline-flex items-center gap-1 text-aece-approved font-mono text-xs">
                              <Check className="w-4 h-4" /> SAVED
                            </span>
                          ) : (
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleFeedback(item.id, 'approve')}
                                className="p-2 rounded hover:bg-aece-approved/20 text-muted-foreground hover:text-aece-approved transition-colors"
                                title="Approve Logic"
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleFeedback(item.id, 'reject')}
                                className="p-2 rounded hover:bg-aece-blocked/20 text-muted-foreground hover:text-aece-blocked transition-colors"
                                title="Reject Logic"
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </CyberCard>
    </div>
  );
}
