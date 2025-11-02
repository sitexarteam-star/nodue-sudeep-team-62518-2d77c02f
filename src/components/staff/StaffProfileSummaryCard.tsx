import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StaffProfileSummaryCardProps {
  profile: {
    name: string;
    employee_id?: string;
    email: string;
    photo?: string;
    designation?: string;
  };
  role: string;
  basePath: string;
}

export default function StaffProfileSummaryCard({ profile, role, basePath }: StaffProfileSummaryCardProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.photo} alt={profile.name} />
            <AvatarFallback>
              <User className="h-10 w-10" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            {profile.employee_id && (
              <p className="text-sm text-muted-foreground">Staff ID: {profile.employee_id}</p>
            )}
            <p className="text-sm font-medium text-primary">{role}</p>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`${basePath}/profile`)}>
              View Profile
            </Button>
            <Button onClick={() => navigate(`${basePath}/profile/edit`)}>
              Edit Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
