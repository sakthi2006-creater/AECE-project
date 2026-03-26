import { useState } from "react";
import { useEvaluateAction, useGenerateScenario, type EthicalEvaluation } from "@workspace/api-client-react";
import { CyberCard } from "@/components/ui/CyberCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { ReasoningChart } from "@/components/ReasoningChart";
import { Terminal, Cpu, Zap, Info, ShieldCheck, BrainCircuit } from "lucide-react";
import { getDecisionColors } from "@/lib/utils";

export function ScenarioInput() {
  const [scenario, setScenario] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<EthicalEvaluation | null>(null);

  const evaluateMutation = useEvaluateAction({
    mutation: {
      onSuccess: (data) => setResult(data)
    }
  });

  const generateMutation = useGenerateScenario({
    mutation: {
      onSuccess: (data) => {
        setScenario(data.scenario);
        setContext(`Category: ${data.category}`);
        setResult(null); // Clear previous result
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenario.trim()) return;
    evaluateMutation.mutate({ data: { scenario, context } });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2 flex items-center gap-3">
            <Terminal className="w-8 h-8 text-primary" /> Evaluation Terminal
          </h1>
          <p className="text-muted-foreground font-mono">Submit hypothetical or real scenarios for multi-framework ethical analysis.</p>
        </div>
        <NeonButton 
          variant="secondary" 
          onClick={() => generateMutation.mutate({ data: {} })}
          isLoading={generateMutation.isPending}
        >
          <Zap className="w-4 h-4" /> Auto-Generate
        </NeonButton>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Form */}
        <CyberCard className="lg:col-span-5 h-fit">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-primary flex items-center gap-2">
                <Cpu className="w-4 h-4" /> Action / Scenario
              </label>
              <textarea
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="E.g., An autonomous vehicle must choose between swerving into a barrier (harming passengers) or hitting a pedestrian..."
                className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-sm resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Additional Context (Optional)
              </label>
              <input
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Environmental variables, user history, etc."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all font-sans text-sm"
              />
            </div>

            <NeonButton 
              type="submit" 
              className="w-full" 
              isLoading={evaluateMutation.isPending}
              disabled={!scenario.trim()}
            >
              Initialize Analysis
            </NeonButton>
          </form>
        </CyberCard>

        {/* Results Panel */}
        <div className="lg:col-span-7">
          {evaluateMutation.isPending && (
            <CyberCard className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-6 border-primary/50 animate-pulse">
              <div className="relative">
                <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" style={{ width: '80px', height: '80px' }}></div>
                <BrainCircuit className="w-10 h-10 text-primary m-[20px] animate-pulse" />
              </div>
              <div>
                <h3 className="font-display text-xl text-primary tracking-widest uppercase mb-2">Processing Neural Pathways</h3>
                <p className="font-mono text-muted-foreground text-sm">Evaluating utilitarian vs deontological constraints...</p>
              </div>
            </CyberCard>
          )}

          {!evaluateMutation.isPending && !result && (
            <CyberCard className="h-full min-h-[400px] flex flex-col items-center justify-center text-center opacity-50 border-dashed">
              <Info className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-display text-xl tracking-widest uppercase text-muted-foreground">Awaiting Input</h3>
              <p className="font-mono text-sm max-w-sm mt-2">The cognition engine is standing by. Submit a scenario to view real-time ethical computations.</p>
            </CyberCard>
          )}

          {result && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              <CyberCard glow variant={result.decision === 'BLOCKED' ? 'destructive' : 'default'} className="overflow-visible">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                  <div className="flex-shrink-0">
                    <ScoreGauge score={result.ethicalScore} decision={result.decision} size={160} strokeWidth={8} />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">Executive Summary</h3>
                      <p className="text-white font-sans leading-relaxed">{result.explanation}</p>
                    </div>
                  </div>
                </div>
              </CyberCard>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CyberCard>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Framework Analysis
                  </h3>
                  <ReasoningChart scores={result.frameworkScores} decision={result.decision} />
                </CyberCard>
                
                <CyberCard className="flex flex-col">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-accent mb-4 flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4" /> Suggested Alternatives
                  </h3>
                  <ul className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {result.alternatives.map((alt, i) => (
                      <li key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-gray-300 font-sans">
                        {alt}
                      </li>
                    ))}
                    {result.alternatives.length === 0 && (
                      <li className="text-muted-foreground font-mono text-sm">No viable alternatives identified.</li>
                    )}
                  </ul>
                </CyberCard>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
