import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent/10 animate-[pulse_2s_ease-in-out_infinite] rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
