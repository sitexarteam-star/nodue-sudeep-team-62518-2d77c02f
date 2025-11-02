import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Briefcase, Building2, MapPin, Calendar, Hash } from "lucide-react";

interface FacultyProfileViewProps {
  profile: any;
  stats?: {
    total: number;
    approved: number;
    rejected: number;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function FacultyProfileView({ profile, stats, isOpen, onClose }: FacultyProfileViewProps) {
  if (!profile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Faculty Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with Photo */}
          <div className="flex flex-col items-center gap-4 pb-4 border-b">
            <Avatar className="h-32 w-32">
              <AvatarImage src={profile.photo} alt={profile.name} />
              <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                {profile.name?.charAt(0) || 'F'}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
              <p className="text-muted-foreground">{profile.designation}</p>
              <Badge variant={profile.is_active ? "default" : "secondary"} className="mt-2">
                {profile.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {/* Personal Details */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Personal Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground w-32">Employee ID:</span>
                <span className="font-medium text-foreground">{profile.employee_id}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground w-32">Email:</span>
                <span className="font-medium text-foreground">{profile.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground w-32">Phone:</span>
                  <span className="font-medium text-foreground">{profile.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Academic Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground w-32">Department:</span>
                <span className="font-medium text-foreground">{profile.department}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground w-32">Designation:</span>
                <span className="font-medium text-foreground">{profile.designation}</span>
              </div>
              {profile.office_location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground w-32">Office Location:</span>
                  <span className="font-medium text-foreground">{profile.office_location}</span>
                </div>
              )}
              {profile.date_of_joining && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground w-32">Date of Joining:</span>
                  <span className="font-medium text-foreground">
                    {new Date(profile.date_of_joining).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Account Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground w-32">Created:</span>
                <span className="font-medium text-foreground">
                  {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground w-32">Last Updated:</span>
                <span className="font-medium text-foreground">
                  {new Date(profile.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <div>
              <h3 className="font-semibold mb-3 text-foreground">Application Statistics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Total Processed</div>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-success">{stats.approved}</div>
                  <div className="text-sm text-muted-foreground">Approved</div>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
                  <div className="text-sm text-muted-foreground">Rejected</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
