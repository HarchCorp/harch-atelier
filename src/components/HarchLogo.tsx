import Link from "next/link";

export function HarchLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 group min-w-0 h-9">
      <span className="text-base sm:text-lg font-bold tracking-[0.2em] text-white uppercase truncate leading-none">
        HARCH
      </span>
      <span className="text-[rgba(255,255,255,0.15)] text-base sm:text-lg font-light leading-none">
        |
      </span>
      <span className="text-base sm:text-lg font-light tracking-[0.2em] text-[#999999] uppercase truncate leading-none">
        CORP
      </span>
    </Link>
  );
}
