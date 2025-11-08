import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, RefreshCw, Users, GraduationCap, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface Batch {
  id: string;
  name: string;
  start_year: number;
  end_year: number;
  current_semester: number;
  student_count: number;
}

const UpdateSemester = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [selectedBatch, setSelectedBatch] = useState('');
  const [newSemester, setNewSemester] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add Batch Dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBatchName, setNewBatchName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Delete Batch Dialog
  const [batchToDelete, setBatchToDelete] = useState<Batch | null>(null);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      // Fetch batches with student counts
      const { data: batchData, error: batchError } = await (supabase as any)
        .from('batches')
        .select('*')
        .order('start_year', { ascending: false });

      if (batchError) throw batchError;

      // For each batch, count students
      const batchesWithCounts = await Promise.all(
        (batchData || []).map(async (batch: any) => {
          const { count } = await (supabase as any)
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('batch', batch.name);

          return {
            ...batch,
            student_count: count || 0
          };
        })
      );

      setBatches(batchesWithCounts);
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast({
        title: "Error",
        description: "Failed to load batches",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedBatchData = batches.find(b => b.name === selectedBatch);

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

      // Reset and refresh
      setSelectedBatch('');
      setNewSemester('');
      fetchBatches();
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

  const handleCreateBatch = async () => {
    if (!newBatchName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a batch name",
        variant: "destructive"
      });
      return;
    }

    // Validate format
    const batchPattern = /^\d{4}-\d{2}$/;
    if (!batchPattern.test(newBatchName)) {
      toast({
        title: "Invalid Format",
        description: "Batch name must be in format YYYY-YY (e.g., 2024-28)",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-batch`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ batchName: newBatchName }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create batch');
      }

      toast({
        title: "Success!",
        description: `Batch ${newBatchName} created successfully`,
        action: (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => navigate(`/admin/add-student?batch=${newBatchName}`)}
          >
            Add Students
          </Button>
        ),
      });

      setIsAddDialogOpen(false);
      setNewBatchName('');
      fetchBatches();
    } catch (error: any) {
      console.error('Error creating batch:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create batch",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBatch = async () => {
    if (!batchToDelete || !deleteConfirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-batch`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ batchName: batchToDelete.name }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete batch');
      }

      toast({
        title: "Batch Deleted",
        description: `Deleted ${result.deleted.students} students and ${result.deleted.applications} applications`,
      });

      // Clear selection if deleted batch was selected
      if (selectedBatch === batchToDelete.name) {
        setSelectedBatch('');
      }

      setBatchToDelete(null);
      setDeleteConfirmed(false);
      fetchBatches();
    } catch (error: any) {
      console.error('Error deleting batch:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete batch",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} title="Update Semester" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link to="/dashboard/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Update Semester</h1>
              <p className="text-muted-foreground">Manage batches and update semester for students</p>
            </div>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Batch
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Batch</DialogTitle>
                <DialogDescription>
                  Add a new batch to the system. Format: YYYY-YY (e.g., 2024-28)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="batch-name">Batch Name</Label>
                  <Input
                    id="batch-name"
                    placeholder="e.g., 2024-28"
                    value={newBatchName}
                    onChange={(e) => setNewBatchName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: YYYY-YY (start year - end year last 2 digits)
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBatch} disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Batch'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                      <SelectItem key={batch.id} value={batch.name}>
                        {batch.name} (Current: Sem {batch.current_semester})
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
                    <p className="text-sm">Current Semester: {selectedBatchData?.current_semester}</p>
                    <p className="text-sm">Total Students: {selectedBatchData?.student_count}</p>
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
                        This will update the semester from {selectedBatchData?.current_semester} to {newSemester} for all {selectedBatchData?.student_count} students in batch {selectedBatch}.
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
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading batches...</div>
              ) : batches.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No batches found. Create your first batch to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {batches.map((batch) => (
                    <Card key={batch.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{batch.name}</h4>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{batch.student_count}</span>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => {
                                    setBatchToDelete(batch);
                                    setDeleteConfirmed(false);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Batch {batch.name}?</AlertDialogTitle>
                                  <AlertDialogDescription className="space-y-4">
                                    <p className="text-destructive font-semibold">
                                      ⚠️ This action cannot be undone!
                                    </p>
                                    <div className="bg-muted p-4 rounded-lg space-y-2">
                                      <p className="font-medium">This will permanently delete:</p>
                                      <ul className="list-disc list-inside space-y-1 text-sm">
                                        <li>{batch.student_count} student(s) and their accounts</li>
                                        <li>All applications from this batch</li>
                                        <li>All related faculty assignments</li>
                                      </ul>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id="confirm-delete"
                                        checked={deleteConfirmed}
                                        onCheckedChange={(checked) => setDeleteConfirmed(checked as boolean)}
                                      />
                                      <label
                                        htmlFor="confirm-delete"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                      >
                                        I understand this action cannot be undone
                                      </label>
                                    </div>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => {
                                    setBatchToDelete(null);
                                    setDeleteConfirmed(false);
                                  }}>
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDeleteBatch}
                                    disabled={!deleteConfirmed || isDeleting}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {isDeleting ? 'Deleting...' : 'Delete Batch'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Current Semester</span>
                          <span className="text-lg font-bold text-primary">{batch.current_semester}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default UpdateSemester;
