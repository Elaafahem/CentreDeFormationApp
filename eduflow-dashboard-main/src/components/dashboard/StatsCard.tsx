import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
}

const variantStyles = {
  default: "bg-card",
  primary: "bg-primary-muted border-primary/20",
  success: "bg-success-muted border-success/20",
  warning: "bg-warning-muted border-warning/20",
  destructive: "bg-destructive-muted border-destructive/20",
};

const iconVariantStyles = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export function StatsCard({
  title,
  value,
  icon,
  trend,
  description,
  className,
  variant = "default",
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border shadow-card p-4 transition-all duration-200 hover:shadow-elevated",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <span className="text-3xl font-semibold text-foreground tracking-tight">{value}</span>
        </div>
        <div className={cn("p-3 rounded-lg", iconVariantStyles[variant])}>
          {icon}
        </div>
      </div>

      {(trend || description) && (
        <div className="mt-4 flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "flex items-center gap-1 text-sm font-medium",
                trend.isPositive ? "text-success" : "text-destructive"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {Math.abs(trend.value)}%
            </span>
          )}
          {description && (
            <span className="text-sm text-muted-foreground">{description}</span>
          )}
        </div>
      )}
    </div>
  );
}
