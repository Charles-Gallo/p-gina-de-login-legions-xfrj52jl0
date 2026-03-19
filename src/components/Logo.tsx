import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2 select-none', className)}>
      <div className="relative flex h-8 w-8 items-center justify-center rounded-sm bg-[#1268b3] text-white font-bold text-xl overflow-hidden">
        <span className="z-10 relative">L</span>
        <div className="absolute bottom-0 right-0 h-3 w-3 bg-[#ed1b32] rounded-tl-sm" />
      </div>
      {showText && (
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Legions
        </span>
      )}
    </div>
  )
}
