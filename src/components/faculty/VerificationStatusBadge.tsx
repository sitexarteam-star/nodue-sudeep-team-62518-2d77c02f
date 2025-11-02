import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface VerificationStatusBadgeProps {
  verified: boolean | null;
  label: string;
}

export default function VerificationStatusBadge({ verified, label }: VerificationStatusBadgeProps) {
  if (verified === true) {
    return (
      <Badge className="bg-success/10 text-success border-success/20 flex items-center gap-1" variant="outline">
        <CheckCircle2 className="h-3 w-3" />
        {label} Verified
      </Badge>
    );
  }
  
  if (verified === false) {
    return (
      <Badge className="bg-destructive/10 text-destructive border-destructive/20 flex items-center gap-1" variant="outline">
        <XCircle className="h-3 w-3" />
        {label} Not Verified
      </Badge>
    );
  }
  
  return (
    <Badge className="bg-muted text-muted-foreground flex items-center gap-1" variant="outline">
      <Clock className="h-3 w-3" />
      {label} Pending
    </Badge>
  );
}
