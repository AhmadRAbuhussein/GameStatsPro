interface LoadingSpinnerProps {
  className?: string;
}

export default function LoadingSpinner({ className = "h-8 w-8" }: LoadingSpinnerProps) {
  return (
    <div 
      className={`animate-spin rounded-full border-2 border-t-transparent ${className}`}
      style={{ borderColor: 'var(--gaming-pink)', borderTopColor: 'transparent' }}
      data-testid="loading-spinner"
    />
  );
}