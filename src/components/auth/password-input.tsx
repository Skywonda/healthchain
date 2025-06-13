import { Input } from "../ui/input";
import { Eye, EyeOff } from "lucide-react";
import React from "react";

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input> & { showPassword: boolean; onToggle: () => void; }
>(({ showPassword, onToggle, ...props }, ref) => (
  <div className="relative">
    <Input
      {...props}
      ref={ref}
      type={showPassword ? 'text' : 'password'}
    />
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-[38px] h-2 w-5 text-gray-400 hover:text-gray-600 transition-colors"
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <EyeOff /> : <Eye />}
    </button>
  </div>
));
PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
