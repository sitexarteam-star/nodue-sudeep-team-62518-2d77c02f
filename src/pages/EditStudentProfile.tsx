import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import DashboardHeader from "@/components/DashboardHeader";
import { ArrowLeft, Upload, Camera } from "lucide-react";

const EditStudentProfile = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login/student");
      return;
    }

    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setEmail(data.email || user.email || "");
        setPhoto(data.photo || "");
        setPhotoPreview(data.photo || "");
      }
    } catch (error: any) {
      toast.error('Failed to load profile');
      console.error(error);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    setIsLoading(true);

    try {
      let photoUrl = photo;

      // Upload photo if changed
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        // Convert file to base64 for storage in database
        const reader = new FileReader();
        reader.readAsDataURL(photoFile);
        await new Promise((resolve) => {
          reader.onloadend = () => {
            photoUrl = reader.result as string;
            resolve(true);
          };
        });
      }

      const updateData = {
        email: email.trim(),
        photo: photoUrl
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      await refreshProfile();
      navigate('/student/profile');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <DashboardHeader 
        title="Edit Profile"
        user={{
          name: profile.name,
          email: email,
          role: 'student'
        }}
      />

      <div className="container mx-auto p-6 max-w-3xl">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/student/profile')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <p className="text-sm text-muted-foreground">You can only edit your photo and email</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload Section */}
              <div className="flex flex-col items-center space-y-4 pb-6 border-b">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  {photoPreview ? (
                    <AvatarImage src={photoPreview} alt={profile.name} />
                  ) : (
                    <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="flex flex-col items-center gap-2">
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                      <Camera className="h-4 w-4" />
                      Change Photo
                    </div>
                    <Input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </Label>
                  <p className="text-xs text-muted-foreground text-center">
                    Accepts JPG, PNG or WEBP (Max 5MB)
                  </p>
                </div>
              </div>

              {/* Editable Field: Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Read-Only Fields */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-muted-foreground text-sm">Profile Information (Read-Only)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={profile.name} disabled className="bg-muted" />
                  </div>

                  <div className="space-y-2">
                    <Label>College Number (USN)</Label>
                    <Input value={profile.usn} disabled className="bg-muted" />
                  </div>

                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input value={profile.department} disabled className="bg-muted" />
                  </div>

                  <div className="space-y-2">
                    <Label>Section</Label>
                    <Input value={profile.section} disabled className="bg-muted" />
                  </div>

                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Input value={`Semester ${profile.semester}`} disabled className="bg-muted" />
                  </div>

                  <div className="space-y-2">
                    <Label>Batch</Label>
                    <Input value={profile.batch} disabled className="bg-muted" />
                  </div>

                  <div className="space-y-2">
                    <Label>Student Type</Label>
                    <Input value={profile.student_type} disabled className="bg-muted capitalize" />
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={profile.phone || 'Not provided'} disabled className="bg-muted" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/student/profile')}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditStudentProfile;
