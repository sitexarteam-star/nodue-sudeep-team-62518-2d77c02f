import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Edit, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileSummaryCardProps {
  profile: any;
}

export const ProfileSummaryCard = ({ profile }: ProfileSummaryCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile?.photo} alt={profile?.name} />
            <AvatarFallback className="text-2xl">
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">{profile?.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium">Staff ID:</span> {profile?.employee_id || "N/A"}
              </p>
              <p>
                <span className="font-medium">Role:</span> Lab Instructor
              </p>
              <p>
                <span className="font-medium">Department:</span> {profile?.department || "All Departments"}
              </p>
              <p>
                <span className="font-medium">Email:</span> {profile?.email}
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-col sm:flex-row">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/lab-instructor/profile")}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/lab-instructor/profile/edit")}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
