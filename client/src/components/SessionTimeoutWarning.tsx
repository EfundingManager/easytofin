import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Clock } from "lucide-react";

interface SessionTimeoutWarningProps {
  open: boolean;
  timeRemaining: number;
  onExtend: () => void;
  onLogout: () => void;
  isLoggingOut?: boolean;
}

/**
 * SessionTimeoutWarning - Dialog that warns user about upcoming session timeout
 * Shows time remaining and allows user to extend session or logout
 */
export function SessionTimeoutWarning({
  open,
  timeRemaining,
  onExtend,
  onLogout,
  isLoggingOut = false,
}: SessionTimeoutWarningProps) {
  // Convert milliseconds to minutes and seconds
  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            <AlertDialogTitle>Session Expiring Soon</AlertDialogTitle>
          </div>
        </AlertDialogHeader>
        <AlertDialogDescription className="space-y-3">
          <p>
            Your session will expire in <span className="font-semibold text-amber-600">{timeDisplay}</span> due to inactivity.
          </p>
          <p>
            Click "Continue Session" to stay logged in, or "Sign Out" to end your session now.
          </p>
        </AlertDialogDescription>
        <div className="flex gap-3 justify-end">
          <AlertDialogCancel
            onClick={onLogout}
            disabled={isLoggingOut}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Sign Out
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onExtend}
            disabled={isLoggingOut}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoggingOut ? "Signing out..." : "Continue Session"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
