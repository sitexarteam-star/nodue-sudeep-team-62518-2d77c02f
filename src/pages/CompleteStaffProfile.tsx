import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { UserCircle } from "lucide-react";

const CompleteStaffProfile = () => {
  const navigate = useNavigate();
  const { user, userRoles, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    designation: string;
    department: "AIML" | "CD" | "CIVIL" | "CSE" | "EC" | "MECH" | "";
    office_location: string;
    employee_id: string;
  }>({
    name: "",
    phone: "",
    designation: "",
    department: "",
    office_location: "",
    employee_id: ""
  });

  useEffect(() => {
    if (!user) {
      // Redirect based on role
      const role = userRoles[0] || 'admin';
      navigate(`/login/${role}`);
      return;
    }

    fetchProfile();
  }, [user, userRoles, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('staff_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          designation: data.designation || "",
          department: data.department || "",
          office_location: data.office_location || "",
          employee_id: data.employee_id || ""
        });

        // Check if profile is completed (has all required fields)
        const isCompleted = data.name && data.phone && data.designation;
        if (isCompleted) {
          const role = userRoles[0] || 'admin';
          navigate(`/dashboard/${role}`);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // Validate required fields
    if (!formData.name || !formData.phone || !formData.designation) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const updateData = {
        ...formData,
        department: formData.department || null
      };

      const { error } = await supabase
        .from('staff_profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile completed successfully!');
      await refreshProfile();
      
      const role = userRoles[0] || 'admin';
      navigate(`/dashboard/${role}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary text-primary-foreground p-3 rounded-xl">
              <UserCircle className="h-10 w-10" />
            </div>
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>
              Please fill in your details to continue
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  disabled={isLoading}
                  maxLength={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">Designation *</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  required
                  disabled={isLoading}
                  placeholder="e.g., Assistant Professor"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee_id">Employee ID</Label>
                <Input
                  id="employee_id"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value as typeof formData.department })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MECH">Mechanical</SelectItem>
                    <SelectItem value="CSE">Computer Science</SelectItem>
                    <SelectItem value="CIVIL">Civil</SelectItem>
                    <SelectItem value="EC">Electronics & Communication</SelectItem>
                    <SelectItem value="AIML">AI & ML</SelectItem>
                    <SelectItem value="CD">Computer Science & Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="office_location">Office Location</Label>
                <Input
                  id="office_location"
                  value={formData.office_location}
                  onChange={(e) => setFormData({ ...formData, office_location: e.target.value })}
                  disabled={isLoading}
                  placeholder="e.g., Block A, Room 301"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Complete Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteStaffProfile;
