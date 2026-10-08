import Image from "next/image";

export function Logo({ compact = false }: { compact?: boolean }) {
  const sizeClass = compact ? "h-10 w-10" : "h-12 w-12";

  return (
    <span
      className="inline-flex items-center"
      aria-label="MB"
      title="MB"
    >
      <span
        className={`${sizeClass} relative block shrink-0 overflow-hidden rounded-full bg-black ring-1 ring-white/15 shadow-[0_0_28px_rgba(255,255,255,0.08)] transition duration-300 hover:ring-[#d7b66f]/45`}
      >
        <Image
          src="/images/mb-logo.jpg"
          alt="MB"
          fill
          priority
          sizes={compact ? "40px" : "48px"}
          className="object-cover"
        />
      </span>
    </span>
  );
}
