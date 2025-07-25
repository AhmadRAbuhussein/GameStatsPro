import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
}

export default function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div 
      className={cn("animate-spin rounded-full border-b-2", className)}
      style={{ 
        borderColor: 'transparent transparent var(--gaming-pink) transparent',
        width: '32px',
        height: '32px'
      }}
      data-testid="loading-spinner"
    />
  );
}
