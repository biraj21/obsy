import { forwardRef } from "react";

import cn from "@/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => {
  return <button className={cn("btn", className)} ref={ref} {...props} />;
});
Button.displayName = "Button";

export default Button;
