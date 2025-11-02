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

const CompleteStudentProfile = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    department: "AIML" | "CD" | "CIVIL" | "CSE" | "EC" | "MECH" | "";
    section: "A" | "B" | "";
    semester: string;
    student_type: "local" | "hostel" | "";
    batch: string;
  }>({
    name: "",
    phone: "",
    department: "",
    section: "",
    semester: "",
    student_type: "",
    batch: ""
  });

  useEffect(() => {
    if (!user) {
      navigate("/login/student");
      return;
    }

    // Fetch existing profile data
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          department: data.department || "",
          section: data.section || "",
          semester: data.semester?.toString() || "",
          student_type: data.student_type || "",
          batch: data.batch || ""
        });

        // If profile is already completed, redirect to dashboard
        if (data.profile_completed) {
          navigate("/dashboard/student");
        }
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // Validate all fields are filled
    if (!formData.name || !formData.phone || !formData.department || 
        !formData.section || !formData.semester || !formData.student_type || !formData.batch) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        department: formData.department || null,
        section: formData.section || null,
        semester: parseInt(formData.semester),
        student_type: formData.student_type || null,
        batch: formData.batch,
        profile_completed: true
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile completed successfully!');
      await refreshProfile();
      navigate('/dashboard/student');
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
                <Label htmlFor="department">Department *</Label>
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
                <Label htmlFor="section">Section *</Label>
                <Select
                  value={formData.section}
                  onValueChange={(value) => setFormData({ ...formData, section: value as typeof formData.section })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester">Semester *</Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) => setFormData({ ...formData, semester: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="student_type">Student Type *</Label>
                <Select
                  value={formData.student_type}
                  onValueChange={(value) => setFormData({ ...formData, student_type: value as typeof formData.student_type })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="hostel">Hostel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="batch">Batch *</Label>
                <Input
                  id="batch"
                  placeholder="e.g., 2021-2025"
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  required
                  disabled={isLoading}
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

export default CompleteStudentProfile;
