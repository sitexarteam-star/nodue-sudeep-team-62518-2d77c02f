import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Briefcase, Building2, Eye, Edit } from "lucide-react";

interface FacultyProfileCardProps {
  profile: any;
  onViewProfile: () => void;
  onEditProfile: () => void;
}

export default function FacultyProfileCard({ profile, onViewProfile, onEditProfile }: FacultyProfileCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex justify-center md:justify-start">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.photo} alt={profile?.name} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {profile?.name?.charAt(0) || 'F'}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{profile?.name}</h2>
              <p className="text-sm text-muted-foreground">Employee ID: {profile?.employee_id}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{profile?.department}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span>{profile?.designation}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{profile?.email}</span>
              </div>
              {profile?.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{profile?.phone}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={onViewProfile}>
                <Eye className="h-4 w-4 mr-2" />
                View Profile
              </Button>
              <Button variant="outline" size="sm" onClick={onEditProfile}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
