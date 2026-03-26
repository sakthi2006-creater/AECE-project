import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost";
  isLoading?: boolean;
}

export const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, variant = "primary", isLoading, children, disabled, ...props }, ref) => {
    
    const variants = {
      primary: "bg-primary/10 text-primary border-primary hover:bg-primary hover:text-primary-foreground shadow-[0_0_10px_rgba(0,212,255,0.2)] hover:shadow-[0_0_20px_rgba(0,212,255,0.6)]",
      secondary: "bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary hover:border-muted-foreground",
      destructive: "bg-destructive/10 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground shadow-[0_0_10px_rgba(255,0,68,0.2)] hover:shadow-[0_0_20px_rgba(255,0,68,0.6)]",
      ghost: "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-white/5",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={cn(
          "relative flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-display uppercase tracking-widest font-semibold border transition-all duration-300 overflow-hidden",
          variants[variant],
          (disabled || isLoading) && "opacity-50 cursor-not-allowed hover:bg-inherit hover:shadow-none hover:text-inherit",
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
        
        {/* Scanning line effect on hover for primary/destructive */}
        {(variant === "primary" || variant === "destructive") && !disabled && !isLoading && (
          <div className="absolute inset-0 -translate-x-full hover:animate-[scan_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 z-0" />
        )}
      </motion.button>
    );
  }
);
NeonButton.displayName = "NeonButton";
