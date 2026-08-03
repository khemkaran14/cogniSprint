import { Link, type LinkProps } from "react-router-dom";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function LinkButton({
  className,
  variant,
  size,
  ...props
}: LinkProps & VariantProps<typeof buttonVariants>) {
  return <Link className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
