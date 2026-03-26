import { useState, useEffect } from "react";
import { useGetWeights, useUpdateWeights, useOverrideDecision, type EthicalWeights } from "@workspace/api-client-react";
import { CyberCard } from "@/components/ui/CyberCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { SlidersHorizontal, AlertTriangle, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Governance() {
  const { data: currentWeights, isLoading: isLoadingWeights } = useGetWeights();
  const updateWeightsMutation = useUpdateWeights();
  const overrideMutation = useOverrideDecision();
  const { toast } = useToast();

  const [weights, setWeights] = useState<EthicalWeights>({
    utilitarian: 0.2, deontological: 0.2, virtue: 0.2, care: 0.2, context: 0.2
  });

  // Override Form State
  const [overrideId, setOverrideId] = useState("");
  const [overrideDecision, setOverrideDecision] = useState<any>("BLOCKED");
  const [overrideReason, setOverrideReason] = useState("");

  useEffect(() => {
    if (currentWeights) {
      setWeights(currentWeights);
    }
  }, [currentWeights]);

  const handleWeightChange = (key: keyof EthicalWeights, value: number) => {
    setWeights(prev => ({ ...prev, [key]: value / 100 }));
  };

  const handleSaveWeights = () => {
    // Normalize to 1.0 before saving
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    if (sum === 0) return; // Prevent division by zero
    
    const normalized: EthicalWeights = {
      utilitarian: weights.utilitarian / sum,
      deontological: weights.deontological / sum,
      virtue: weights.virtue / sum,
      care: weights.care / sum,
      context: weights.context / sum,
    };

    updateWeightsMutation.mutate({ data: normalized }, {
      onSuccess: () => {
        toast({ title: "Protocol Updated", description: "Ethical weights have been recalibrated globally." });
        setWeights(normalized);
      },
      onError: () => {
        toast({ title: "Update Failed", description: "Failed to calibrate weights.", variant: "destructive" });
      }
    });
  };

  const handleOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideId || !overrideReason) return;
    
    overrideMutation.mutate({
      data: {
        decisionId: parseInt(overrideId),
        overrideDecision,
        reason: overrideReason
      }
    }, {
      onSuccess: () => {
        toast({ title: "Override Applied", description: `Decision #${overrideId} has been forcibly altered.` });
        setOverrideId("");
        setOverrideReason("");
      },
      onError: () => {
        toast({ title: "Override Failed", description: "Could not apply manual override. Ensure ID is valid.", variant: "destructive" });
      }
    });
  };

  const currentSum = Object.values(weights).reduce((a, b) => a + b, 0);

  if (isLoadingWeights) return <div className="p-8 text-center text-primary font-mono">Loading protocols...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-4xl font-display font-bold text-white mb-2 flex items-center gap-3">
          <SlidersHorizontal className="w-8 h-8 text-primary" /> System Governance
        </h1>
        <p className="text-muted-foreground font-mono">Modify core ethical frameworks and override critical decisions.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Weights Calibration */}
        <CyberCard>
          <div className="mb-6 pb-4 border-b border-white/10 flex justify-between items-end">
            <div>
              <h2 className="text-xl font-display uppercase tracking-widest text-primary">Framework Weights</h2>
              <p className="text-xs text-muted-foreground font-mono mt-1">Calibrate the LLM's philosophical bias. Will normalize to 100%.</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block">Current Sum</span>
              <span className={`font-mono font-bold ${(currentSum > 1.01 || currentSum < 0.99) ? 'text-aece-flagged' : 'text-aece-approved'}`}>
                {(currentSum * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {(Object.keys(weights) as Array<keyof EthicalWeights>).map((key) => {
              const val = weights[key] * 100;
              // calculate normalized percentage just for display
              const normalizedPct = currentSum > 0 ? ((weights[key] / currentSum) * 100).toFixed(1) : 0;
              return (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-sm font-mono">
                    <span className="capitalize text-gray-300">{key}</span>
                    <span className="text-primary">{normalizedPct}% <span className="text-muted-foreground text-xs ml-2">(Raw: {val.toFixed(0)})</span></span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={val}
                    onChange={(e) => handleWeightChange(key, parseInt(e.target.value))}
                    className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              )
            })}
          </div>

          <div className="mt-8">
            <NeonButton 
              className="w-full" 
              onClick={handleSaveWeights}
              isLoading={updateWeightsMutation.isPending}
            >
              <Save className="w-4 h-4" /> Recalibrate Protocols
            </NeonButton>
          </div>
        </CyberCard>

        {/* Manual Override */}
        <CyberCard variant="destructive">
          <div className="mb-6 pb-4 border-b border-destructive/20">
            <h2 className="text-xl font-display uppercase tracking-widest text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Manual Override
            </h2>
            <p className="text-xs text-destructive/70 font-mono mt-1">Danger: This forcibly changes a recorded decision state.</p>
          </div>

          <form onSubmit={handleOverrideSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-destructive/80">Decision ID</label>
              <input
                type="number"
                value={overrideId}
                onChange={(e) => setOverrideId(e.target.value)}
                placeholder="e.g. 1042"
                className="w-full bg-black/40 border border-destructive/30 rounded-xl px-4 py-3 text-white placeholder:text-destructive/30 focus:outline-none focus:border-destructive transition-all font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-destructive/80">Force State</label>
              <div className="grid grid-cols-2 gap-2">
                {["APPROVED", "CONDITIONAL", "FLAGGED", "BLOCKED"].map((state) => (
                  <button
                    key={state}
                    type="button"
                    onClick={() => setOverrideDecision(state)}
                    className={`p-2 border rounded-lg font-mono text-xs tracking-widest uppercase transition-all ${
                      overrideDecision === state 
                        ? 'bg-destructive/20 border-destructive text-white shadow-[0_0_10px_rgba(255,0,68,0.3)]' 
                        : 'border-white/10 text-muted-foreground hover:border-white/30'
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-destructive/80">Override Reason / Audit Note</label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Required for compliance logging..."
                className="w-full h-24 bg-black/40 border border-destructive/30 rounded-xl p-4 text-white placeholder:text-destructive/30 focus:outline-none focus:border-destructive transition-all font-sans text-sm resize-none"
                required
              />
            </div>

            <NeonButton 
              type="submit" 
              variant="destructive" 
              className="w-full"
              disabled={!overrideId || !overrideReason}
              isLoading={overrideMutation.isPending}
            >
              Execute Override
            </NeonButton>
          </form>
        </CyberCard>

      </div>
    </div>
  );
}
