import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Activity, BrainCircuit, History, ShieldAlert, SlidersHorizontal, Menu, X } from "lucide-react";
import { ThreeBackground } from "./ui/ThreeBackground";
import { useAppWebSocket } from "@/hooks/use-websocket";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: Activity },
  { href: "/scenario", label: "Terminal", icon: BrainCircuit },
  { href: "/history", label: "Audit Log", icon: History },
  { href: "/governance", label: "Governance", icon: SlidersHorizontal },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isConnected } = useAppWebSocket();

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full font-sans text-foreground overflow-hidden">
      <ThreeBackground />
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 glass-panel border-b border-white/10 z-50">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-primary" />
          <span className="font-display font-bold text-xl tracking-widest text-white">AECE</span>
        </div>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 text-muted-foreground hover:text-white">
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 w-64 glass-panel border-r border-white/5 flex flex-col z-40 transition-transform duration-300 md:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:block">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="w-8 h-8 text-primary drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
            <h1 className="font-display font-bold text-3xl tracking-widest text-white">AECE</h1>
          </div>
          <p className="text-[10px] font-mono text-primary/70 uppercase tracking-widest">
            Autonomous Ethical Cognition Engine
          </p>
        </div>

        <div className="flex-1 px-4 py-8 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-display uppercase tracking-widest text-sm transition-all duration-200 cursor-pointer group",
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/30 shadow-[0_0_15px_rgba(0,212,255,0.1)]" 
                    : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
                )}>
                  <item.icon className={cn("w-5 h-5", isActive ? "drop-shadow-[0_0_5px_rgba(0,212,255,0.8)]" : "group-hover:scale-110 transition-transform")} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-6 mt-auto">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/40 border border-white/5">
            <div className="relative flex h-3 w-3">
              <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isConnected ? "bg-aece-approved" : "bg-aece-blocked")} />
              <span className={cn("relative inline-flex rounded-full h-3 w-3", isConnected ? "bg-aece-approved" : "bg-aece-blocked")} />
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {isConnected ? "Uplink Active" : "Uplink Lost"}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative z-10 overflow-y-auto h-[calc(100vh-73px)] md:h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto pb-20">
          {children}
        </div>
      </main>
      
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
}
