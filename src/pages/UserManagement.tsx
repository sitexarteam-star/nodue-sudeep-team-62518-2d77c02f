import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Users, UserCheck } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";

const UserManagement = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Mock data for users
  const users = [
    { id: '1', name: 'John Doe', email: 'john@nodex.edu', role: 'student', department: 'CSE', collegeno: '21CS001', batch: '2021-25', status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@nodex.edu', role: 'student', department: 'CSE', collegeno: '21CS045', batch: '2021-25', status: 'active' },
    { id: '3', name: 'Dr. Sarah Wilson', email: 'sarah@nodex.edu', role: 'faculty', department: 'CSE', status: 'active' },
    { id: '4', name: 'Library Staff', email: 'library@nodex.edu', role: 'library', status: 'active' },
    { id: '5', name: 'Hostel Warden', email: 'hostel@nodex.edu', role: 'hostel', status: 'active' },
    { id: '6', name: 'Office Staff', email: 'office@nodex.edu', role: 'office', status: 'active' },
    { id: '7', name: 'Dr. Michael Johnson', email: 'michael@nodex.edu', role: 'hod', department: 'CSE', status: 'active' },
    { id: '8', name: 'Lab Instructor', email: 'lab@nodex.edu', role: 'lab', status: 'active' }
  ];

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (u.collegeno && u.collegeno.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: string) => {
    const variants: { [key: string]: any } = {
      admin: 'default',
      student: 'secondary',
      faculty: 'outline',
      library: 'destructive',
      hostel: 'secondary',
      office: 'secondary',
      hod: 'default',
      lab: 'outline'
    };
    return variants[role] || 'secondary';
  };

  const stats = [
    { title: "Total Users", value: users.length, icon: Users },
    { title: "Active Students", value: users.filter(u => u.role === 'student').length, icon: UserCheck },
    { title: "Faculty Members", value: users.filter(u => u.role === 'faculty' || u.role === 'hod').length, icon: UserCheck },
    { title: "Staff Members", value: users.filter(u => ['library', 'hostel', 'office', 'lab'].includes(u.role)).length, icon: UserCheck }
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} title="User Management" />
      
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

        {/* Filters and Actions */}
        <Card className="shadow-md mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Create and manage user accounts for the system</CardDescription>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary hover:bg-primary-dark">
                    <Plus className="mr-2 h-4 w-4" />
                    Create User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                      Add a new user to the system. Choose the appropriate role.
                    </DialogDescription>
                  </DialogHeader>
                  <CreateUserForm onClose={() => setIsCreateDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or college number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="library">Library</SelectItem>
                  <SelectItem value="hostel">Hostel</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="hod">HOD</SelectItem>
                  <SelectItem value="lab">Lab</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.department || '-'}</TableCell>
                    <TableCell>
                      {user.collegeno && <div className="text-sm">{user.collegeno}</div>}
                      {user.batch && <div className="text-xs text-muted-foreground">{user.batch}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Active</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const CreateUserForm = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    collegeno: '',
    batch: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle user creation
    console.log('Creating user:', formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="faculty">Faculty</SelectItem>
            <SelectItem value="library">Library Staff</SelectItem>
            <SelectItem value="hostel">Hostel Staff</SelectItem>
            <SelectItem value="office">Office Staff</SelectItem>
            <SelectItem value="hod">HOD</SelectItem>
            <SelectItem value="lab">Lab Instructor</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {formData.role && (
        <>
          {['student', 'faculty', 'hod'].includes(formData.role) && (
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSE">Computer Science Engineering</SelectItem>
                  <SelectItem value="ECE">Electronics & Communication</SelectItem>
                  <SelectItem value="ME">Mechanical Engineering</SelectItem>
                  <SelectItem value="CE">Civil Engineering</SelectItem>
                  <SelectItem value="EEE">Electrical Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {formData.role === 'student' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="collegeno">College Number</Label>
                <Input
                  id="collegeno"
                  value={formData.collegeno}
                  onChange={(e) => setFormData({...formData, collegeno: e.target.value})}
                  placeholder="e.g., 21CS001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch">Batch</Label>
                <Input
                  id="batch"
                  value={formData.batch}
                  onChange={(e) => setFormData({...formData, batch: e.target.value})}
                  placeholder="e.g., 2021-25"
                />
              </div>
            </>
          )}
        </>
      )}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-primary hover:bg-primary-dark">
          Create User
        </Button>
      </div>
    </form>
  );
};

export default UserManagement;