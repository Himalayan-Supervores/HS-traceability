import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

export type TraceStep = {
  title: string;
  subtitle?: string;
  date?: string;
  done: boolean;
};

export function TraceabilityChain({ steps, compact = false }: { steps: TraceStep[]; compact?: boolean }) {
  return (
    <ol className="relative">
      {steps.map((step, i) => (
        <li key={i} className="relative flex gap-4 pb-8 last:pb-0">
          {i < steps.length - 1 && (
            <span
              className={cn(
                "absolute left-[11px] top-6 h-full w-px",
                step.done ? "bg-pine-400" : "bg-line"
              )}
              aria-hidden
            />
          )}
          <span className="relative z-10 mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white">
            {step.done ? (
              <CheckCircle2 className="h-6 w-6 text-pine-600" />
            ) : (
              <Circle className="h-6 w-6 text-line" />
            )}
          </span>
          <div className={compact ? "pb-1" : "pb-2"}>
            <p className={cn("font-medium", step.done ? "text-ink" : "text-ink/40")}>{step.title}</p>
            {step.subtitle && (
              <p className={cn("text-sm", step.done ? "text-sage" : "text-ink/30")}>{step.subtitle}</p>
            )}
            {step.date && <p className="mt-0.5 font-mono text-xs text-sage">{step.date}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
