import { cn } from '@/lib/utils'

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  showText?: boolean
}

export function Logo({ className, showText = true, ...props }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)} {...props}>
      <img
        src="https://charlesgallo.com.br/wp-content/uploads/2026/04/roda_charles_gallo_171px.jpg"
        alt="Legions Logo"
        className="h-10 w-10 rounded-md object-contain shadow-sm"
      />
      {showText && <span className="text-2xl font-bold tracking-tight text-[#1268b3]">Portal</span>}
    </div>
  )
}
