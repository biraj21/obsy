import { forwardRef } from "react";

import cn from "@/utils/cn";

const Button = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    return <button className={cn("btn", className)} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export default Button;
