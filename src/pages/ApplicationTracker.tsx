import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Eye, FileText, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import { supabase } from "@/lib/supabase";

const ApplicationTracker = () => {
  const { user } = useAuth();
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [applications, setApplications] = useState<any[]>([]);

  const batches = ['2021-25', '2022-26', '2023-27', '2024-28'];
  const departments = ['MECH', 'CSE', 'CIVIL', 'EC', 'AIML', 'CD'];

  useEffect(() => {
    if (selectedBatch && selectedDepartment) {
      fetchApplications();
    }
  }, [selectedBatch, selectedDepartment]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('applications')
        .select(`
          *,
          profiles:student_id (name, usn, department, semester)
        `)
        .eq('batch', selectedBatch)
        .eq('department', selectedDepartment as any)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const calculateProgress = (app: any) => {
    let completed = 0;
    const total = 6;

    if (app.library_verified) completed++;
    if (app.hostel_verified) completed++;
    if (app.college_office_verified) completed++;
    if (app.hod_verified) completed++;
    if (app.payment_verified) completed++;
    if (app.lab_verified) completed++;

    return Math.round((completed / total) * 100);
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: any } = {
      'pending': { variant: 'outline', label: 'Pending' },
      'completed': { variant: 'default', label: 'Completed' },
      'rejected': { variant: 'destructive', label: 'Rejected' },
    };
    return variants[status] || { variant: 'secondary', label: status };
  };

  const stats = [
    { 
      title: "Total Applications", 
      value: applications.length, 
      icon: FileText, 
      color: "text-primary" 
    },
    { 
      title: "In Progress", 
      value: applications.filter(a => a.status === 'pending').length, 
      icon: Clock, 
      color: "text-warning" 
    },
    { 
      title: "Completed", 
      value: applications.filter(a => a.status === 'completed').length, 
      icon: CheckCircle2, 
      color: "text-success" 
    },
    { 
      title: "Rejected", 
      value: applications.filter(a => a.status === 'rejected').length, 
      icon: XCircle, 
      color: "text-destructive" 
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} title="Application Tracker" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" asChild>
            <Link to="/dashboard/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Application Tracker</h1>
            <p className="text-muted-foreground">Select batch → department → view applications</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-md mb-6">
          <CardHeader>
            <CardTitle>Filter Applications</CardTitle>
            <CardDescription>Select batch and department to view applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Batch</label>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Department</label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedBatch && selectedDepartment && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {stats.map((stat, index) => (
                <Card key={index} className="shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <stat.icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Applications Table */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Applications - {selectedBatch} / {selectedDepartment}</CardTitle>
                <CardDescription>No-due certificate applications from selected batch and department</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application ID</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>USN</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.length > 0 ? (
                      applications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium font-mono text-xs">
                            {app.id.substring(0, 8)}
                          </TableCell>
                          <TableCell>{app.profiles?.name}</TableCell>
                          <TableCell className="font-medium">{app.profiles?.usn}</TableCell>
                          <TableCell>Sem {app.semester}</TableCell>
                          <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Progress value={calculateProgress(app)} className="w-20" />
                              <span className="text-xs text-muted-foreground">{calculateProgress(app)}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadge(app.status).variant}>
                              {getStatusBadge(app.status).label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No applications found for {selectedBatch} - {selectedDepartment}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default ApplicationTracker;
