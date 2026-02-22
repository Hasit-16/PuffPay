import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse bg-white/10 rounded-2xl", className)}
      {...props}
    />
  )
}

export { Skeleton }
