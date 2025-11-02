import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, RefreshCw, Users, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const UpdateSemester = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedBatch, setSelectedBatch] = useState('');
  const [newSemester, setNewSemester] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Mock batch data - in production, fetch from database
  const batches = [
    { id: '2021-25', name: '2021-2025', currentSemester: 7, studentCount: 245 },
    { id: '2022-26', name: '2022-2026', currentSemester: 5, studentCount: 312 },
    { id: '2023-27', name: '2023-2027', currentSemester: 3, studentCount: 289 },
    { id: '2024-28', name: '2024-2028', currentSemester: 1, studentCount: 325 }
  ];

  const selectedBatchData = batches.find(b => b.id === selectedBatch);

  const handleUpdateSemester = async () => {
    if (!selectedBatch || !newSemester) {
      toast({
        title: "Error",
        description: "Please select batch and new semester",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      // Update all students in the batch
      const { error } = await (supabase as any)
        .from('profiles')
        .update({ semester: parseInt(newSemester) })
        .eq('batch', selectedBatch);

      if (error) throw error;

      // Update batch current semester
      await (supabase as any)
        .from('batches')
        .update({ current_semester: parseInt(newSemester) })
        .eq('name', selectedBatch);

      toast({
        title: "Success!",
        description: `Updated semester to ${newSemester} for all students in batch ${selectedBatch}`,
      });

      // Reset selections
      setSelectedBatch('');
      setNewSemester('');
    } catch (error) {
      console.error('Error updating semester:', error);
      toast({
        title: "Error",
        description: "Failed to update semester. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} title="Update Semester" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" asChild>
            <Link to="/dashboard/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Update Semester</h1>
            <p className="text-muted-foreground">Update semester for entire batch of students</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Selection Panel */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Semester Update
              </CardTitle>
              <CardDescription>
                Select batch and new semester to update all students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Batch</label>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.name} (Current: Sem {batch.currentSemester})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedBatch && (
                <>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Batch Information</h4>
                    <p className="text-sm">Batch: {selectedBatchData?.name}</p>
                    <p className="text-sm">Current Semester: {selectedBatchData?.currentSemester}</p>
                    <p className="text-sm">Total Students: {selectedBatchData?.studentCount}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">New Semester</label>
                    <Select value={newSemester} onValueChange={setNewSemester}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose new semester" />
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

                  {newSemester && (
                    <div className="p-4 bg-warning/10 border border-warning rounded-lg">
                      <p className="text-sm font-medium text-warning-foreground mb-2">
                        ⚠️ Confirmation Required
                      </p>
                      <p className="text-sm text-muted-foreground">
                        This will update the semester from {selectedBatchData?.currentSemester} to {newSemester} for all {selectedBatchData?.studentCount} students in batch {selectedBatch}.
                      </p>
                    </div>
                  )}

                  <Button 
                    onClick={handleUpdateSemester} 
                    className="w-full" 
                    disabled={!newSemester || isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Update Semester
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Batches Overview */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                All Batches
              </CardTitle>
              <CardDescription>Current semester status of all batches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {batches.map((batch) => (
                  <Card key={batch.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{batch.name}</h4>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{batch.studentCount}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Current Semester</span>
                        <span className="text-lg font-bold text-primary">{batch.currentSemester}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default UpdateSemester;
