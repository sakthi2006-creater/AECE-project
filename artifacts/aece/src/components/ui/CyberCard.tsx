import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface CyberCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "primary" | "destructive" | "ghost";
  glow?: boolean;
}

export const CyberCard = forwardRef<HTMLDivElement, CyberCardProps>(
  ({ className, variant = "default", glow = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          "relative glass-panel rounded-2xl p-6 overflow-hidden transition-all duration-300",
          {
            "border-primary/20 bg-primary/5": variant === "primary",
            "border-destructive/30 bg-destructive/5": variant === "destructive",
            "border-transparent bg-card/30": variant === "ghost",
            "neon-border-primary": glow && variant === "primary",
          },
          className
        )}
        {...props}
      >
        {/* Top-left corner decorative accent */}
        <div className={cn("absolute top-0 left-0 w-8 h-[2px]", 
          variant === "primary" ? "bg-primary" : 
          variant === "destructive" ? "bg-destructive" : "bg-border"
        )} />
        <div className={cn("absolute top-0 left-0 w-[2px] h-8", 
          variant === "primary" ? "bg-primary" : 
          variant === "destructive" ? "bg-destructive" : "bg-border"
        )} />
        
        {/* Bottom-right corner decorative accent */}
        <div className={cn("absolute bottom-0 right-0 w-8 h-[2px]", 
          variant === "primary" ? "bg-primary" : 
          variant === "destructive" ? "bg-destructive" : "bg-border"
        )} />
        <div className={cn("absolute bottom-0 right-0 w-[2px] h-8", 
          variant === "primary" ? "bg-primary" : 
          variant === "destructive" ? "bg-destructive" : "bg-border"
        )} />
        
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    );
  }
);
CyberCard.displayName = "CyberCard";
