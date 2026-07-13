export function Logo({ className = "text-2xl" }: { className?: string }) {
  return (
    <div className={`font-bold leading-[0.85] tracking-tight ${className}`}>
      <div className="text-foreground">mntr</div>
      <div className="text-accent">ai</div>
    </div>
  );
}
