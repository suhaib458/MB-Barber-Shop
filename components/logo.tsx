export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3" aria-label="MB">
      <span
        className={`${compact ? "h-9 w-9 text-xs" : "h-11 w-11 text-sm"} grid place-items-center rounded-full border border-[#c6a15b]/65 font-serif font-bold tracking-[-.08em] text-[#ead49a]`}
      >
        MB
      </span>
      {!compact && (
        <span className="hidden text-[10px] font-semibold uppercase tracking-[.3em] text-white/45 sm:block">
          Premium Grooming
        </span>
      )}
    </span>
  );
}
