// Re-exported so both `import { cn } from "cn"` (what the shadcn CLI generates)
// and `import { cn } from "@/lib/utils"` (older registry items) resolve to one
// implementation. `cn` is a drop-in replacement for clsx + tailwind-merge.
export { cn } from "cn";
