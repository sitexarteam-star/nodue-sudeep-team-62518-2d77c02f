import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, BookOpen, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { subjectSchema } from "@/utils/validation";
import { z } from 'zod';

const SubjectManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedType, setSelectedType] = useState<'fixed' | 'elective' | ''>('');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [editingSubject, setEditingSubject] = useState<any>(null);

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
  const departments = ['MECH', 'CSE', 'CIVIL', 'EC', 'AIML', 'CD'];

  useEffect(() => {
    if (selectedSemester && selectedDepartment && selectedType) {
      fetchSubjects();
    }
  }, [selectedSemester, selectedDepartment, selectedType]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('subjects')
        .select('*')
        .eq('semester', parseInt(selectedSemester))
        .eq('department', selectedDepartment as any)
        .eq('is_elective', selectedType === 'elective')
        .order('code');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
      const { error } = await (supabase as any)
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Subject deleted successfully",
      });

      fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast({
        title: "Error",
        description: "Failed to delete subject",
        variant: "destructive"
      });
    }
  };

  const handleEditSubject = (subject: any) => {
    setEditingSubject(subject);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} title="Subject Management" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" asChild>
            <Link to="/dashboard/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Subject Management</h1>
            <p className="text-muted-foreground">Manage subjects by semester and department</p>
          </div>
        </div>

        {/* Selection Panel */}
        <Card className="shadow-md mb-6">
          <CardHeader>
            <CardTitle>Select Filters</CardTitle>
            <CardDescription>Choose semester, department, and subject type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Semester</Label>
                <select
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
                  value={selectedSemester}
                  onChange={(e) => {
                    setSelectedSemester(e.target.value);
                    setSelectedType('');
                  }}
                >
                  <option value="">Select Semester</option>
                  {semesters.map((sem) => (
                    <option key={sem} value={sem.toString()}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <select
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setSelectedType('');
                  }}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Subject Type</Label>
                <select
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as 'fixed' | 'elective')}
                  disabled={!selectedSemester || !selectedDepartment}
                >
                  <option value="">Select Type</option>
                  <option value="fixed">Fixed Subjects</option>
                  <option value="elective">Elective Subjects</option>
                </select>
              </div>
            </div>

            {selectedSemester && selectedDepartment && selectedType && (
              <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium">
                  Viewing: <span className="text-primary">Semester {selectedSemester}</span> • 
                  <span className="text-primary"> {selectedDepartment}</span> • 
                  <span className="text-primary"> {selectedType === 'fixed' ? 'Fixed' : 'Elective'} Subjects</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subjects Table */}
        {selectedSemester && selectedDepartment && selectedType && (
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Subjects List
                  </CardTitle>
                  <CardDescription>
                    {subjects.length} {selectedType === 'fixed' ? 'fixed' : 'elective'} subject(s) found
                  </CardDescription>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg">
                      <Plus className="mr-2 h-5 w-5" />
                      Add Subject
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add New Subject</DialogTitle>
                      <DialogDescription>
                        Create a new subject for Semester {selectedSemester} - {selectedDepartment}
                      </DialogDescription>
                    </DialogHeader>
                    <SubjectForm 
                      onClose={() => {
                        setIsCreateDialogOpen(false);
                        fetchSubjects();
                      }}
                      semester={selectedSemester}
                      department={selectedDepartment}
                      isElective={selectedType === 'elective'}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Code</TableHead>
                      <TableHead>Subject Name</TableHead>
                      <TableHead className="w-[100px]">Type</TableHead>
                      <TableHead className="w-[120px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.length > 0 ? (
                      subjects.map((subject) => (
                        <TableRow key={subject.id}>
                          <TableCell className="font-medium font-mono">
                            {subject.code}
                          </TableCell>
                          <TableCell className="font-medium">
                            {subject.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant={subject.is_elective ? 'secondary' : 'default'}>
                              {subject.is_elective ? 'Elective' : 'Fixed'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditSubject(subject)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteSubject(subject.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <BookOpen className="h-12 w-12 opacity-20" />
                            <p className="font-medium">No subjects found</p>
                            <p className="text-sm">Click "Add Subject" button to create your first subject</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {(!selectedSemester || !selectedDepartment || !selectedType) && (
          <Card className="shadow-md">
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-4 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground opacity-20" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Select Filters to View Subjects
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Choose a semester, department, and subject type from the filters above to view and manage subjects
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Subject</DialogTitle>
              <DialogDescription>
                Update subject information
              </DialogDescription>
            </DialogHeader>
            {editingSubject && (
              <SubjectForm 
                onClose={() => {
                  setIsEditDialogOpen(false);
                  setEditingSubject(null);
                  fetchSubjects();
                }}
                semester={selectedSemester}
                department={selectedDepartment}
                isElective={selectedType === 'elective'}
                existingSubject={editingSubject}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

const SubjectForm = ({ 
  onClose, 
  semester,
  department, 
  isElective,
  existingSubject
}: { 
  onClose: () => void;
  semester: string;
  department: string;
  isElective: boolean;
  existingSubject?: any;
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    code: existingSubject?.code || '',
    name: existingSubject?.name || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      const validatedData = subjectSchema.parse({
        code: formData.code,
        name: formData.name,
        department: department,
        semester: parseInt(semester),
        is_elective: isElective
      });

      if (existingSubject) {
        // Update existing subject
        const { error } = await (supabase as any)
          .from('subjects')
          .update({
            code: validatedData.code,
            name: validatedData.name
          })
          .eq('id', existingSubject.id);

        if (error) throw error;

        toast({
          title: "Success!",
          description: "Subject updated successfully",
        });
      } else {
        // Check for duplicate subject code
        const { data: existing } = await (supabase as any)
          .from('subjects')
          .select('code')
          .eq('code', validatedData.code)
          .eq('department', department as any)
          .eq('semester', parseInt(semester))
          .single();

        if (existing) {
          toast({
            title: "Duplicate Subject",
            description: `Subject code ${validatedData.code} already exists for this department and semester`,
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }

        // Create new subject
        const { error } = await (supabase as any)
          .from('subjects')
          .insert([{
            code: validatedData.code,
            name: validatedData.name,
            department: department as any,
            semester: validatedData.semester,
            is_elective: validatedData.is_elective || false
          }]);

        if (error) throw error;

        toast({
          title: "Success!",
          description: "Subject created successfully",
        });
      }

      onClose();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive"
        });
      } else {
        console.error('Error saving subject:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to save subject",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">Subject Code *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({...formData, code: e.target.value})}
            placeholder="e.g., CS301"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Subject Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="e.g., Data Structures and Algorithms"
            required
          />
        </div>
      </div>

      <div className="p-4 bg-muted rounded-lg space-y-1">
        <p className="text-sm font-medium mb-2">Subject Details:</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Semester:</span>
            <span className="ml-2 font-medium">{semester}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Department:</span>
            <span className="ml-2 font-medium">{department}</span>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Type:</span>
            <Badge className="ml-2" variant={isElective ? 'secondary' : 'default'}>
              {isElective ? 'Elective' : 'Fixed'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose} 
          className="flex-1"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : existingSubject ? 'Update Subject' : 'Create Subject'}
        </Button>
      </div>
    </form>
  );
};

export default SubjectManagement;
