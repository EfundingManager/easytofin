import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useState } from "react";

interface RememberDeviceCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  showTooltip?: boolean;
}

/**
 * RememberDeviceCheckbox Component
 *
 * Allows users to opt-in to device trust for streamlined future logins.
 * When checked, the system will recognize this device and skip certain verification steps.
 *
 * Features:
 * - Clean, accessible checkbox with label
 * - Optional tooltip explaining the feature
 * - Disabled state support
 * - Device fingerprinting explanation
 */
export function RememberDeviceCheckbox({
  checked,
  onChange,
  disabled = false,
  showTooltip = true,
}: RememberDeviceCheckboxProps) {
  const [isHovered, setIsHovered] = useState(false);

  const tooltipText =
    "We'll recognize this device on your next login. You can manage trusted devices in your account settings anytime.";

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="remember-device"
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        className="h-4 w-4"
      />
      <div className="flex items-center space-x-1">
        <Label
          htmlFor="remember-device"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Remember this device
        </Label>
        {showTooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full p-0 hover:bg-accent"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  aria-label="Information about remembering this device"
                >
                  <Info
                    size={16}
                    className={`transition-colors ${
                      isHovered ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p>{tooltipText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}

export default RememberDeviceCheckbox;
