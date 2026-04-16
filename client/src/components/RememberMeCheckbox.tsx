import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface RememberMeCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * RememberMe Checkbox Component
 * 
 * Allows users to opt-in for extended session duration (30 days)
 * instead of the default 1 year session.
 * 
 * When checked:
 * - Session cookie maxAge is set to 30 days
 * - User stays logged in across browser restarts
 * - Session expires after 30 days of inactivity
 * 
 * When unchecked:
 * - Session cookie maxAge is set to 1 year
 * - User stays logged in for 1 year
 */
export function RememberMeCheckbox({
  checked,
  onChange,
}: RememberMeCheckboxProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="remember-me"
        checked={checked}
        onCheckedChange={onChange}
        className="h-4 w-4"
      />
      <Label
        htmlFor="remember-me"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
      >
        Keep me signed in for 30 days
      </Label>
    </div>
  );
}
