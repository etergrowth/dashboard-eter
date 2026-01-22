import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode
}

interface TooltipContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const TooltipContext = React.createContext<TooltipContextValue | undefined>(
  undefined
)

function Tooltip({ children }: TooltipProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="relative inline-block"
      >
        {children}
      </div>
    </TooltipContext.Provider>
  )
}

function TooltipTrigger({
  asChild,
  children,
  ...props
}: {
  asChild?: boolean
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, props as any)
  }
  return <div {...props}>{children}</div>
}

function TooltipContent({
  children,
  side = "top",
  align = "center",
  hidden = false,
  className,
  ...props
}: {
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  hidden?: boolean
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(TooltipContext)

  if (hidden || !context?.open) {
    return null
  }

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
  }

  const alignClasses = {
    start: side === "top" || side === "bottom" ? "-translate-x-0 left-0" : "-translate-y-0 top-0",
    center: "",
    end: side === "top" || side === "bottom" ? "-translate-x-0 right-0" : "-translate-y-0 bottom-0",
  }

  return (
    <div
      className={cn(
        "absolute z-50 rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
        sideClasses[side],
        alignClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent }
