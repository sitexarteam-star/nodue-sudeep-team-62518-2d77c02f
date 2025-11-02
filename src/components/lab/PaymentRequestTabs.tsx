import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, XCircle, Clock, User } from "lucide-react";

interface PaymentRequestTabsProps {
  applications: any[];
  onViewDetails: (app: any) => void;
  onApproveRejected: (app: any) => void;
}

export const PaymentRequestTabs = ({
  applications,
  onViewDetails,
  onApproveRejected,
}: PaymentRequestTabsProps) => {
  const pendingApps = applications.filter(
    (a) => !a.lab_verified && a.status !== "rejected" && a.status !== "completed"
  );
  const approvedApps = applications.filter((a) => a.lab_verified && a.status === "completed");
  const rejectedApps = applications.filter((a) => a.status === "rejected" && !a.lab_verified);

  const renderRow = (app: any, showApprove = false) => (
    <TableRow key={app.id}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={app.profiles?.photo} alt={app.profiles?.name} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{app.profiles?.name}</span>
        </div>
      </TableCell>
      <TableCell className="font-mono text-sm">{app.profiles?.usn}</TableCell>
      <TableCell>{app.profiles?.department}</TableCell>
      <TableCell>{app.semester}</TableCell>
      <TableCell>{app.transaction_id || "N/A"}</TableCell>
      <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onViewDetails(app)}>
            View Details
          </Button>
          {showApprove && (
            <Button size="sm" variant="outline" onClick={() => onApproveRejected(app)}>
              <CheckCircle className="mr-1 h-3 w-3" />
              Re-approve
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pending" className="relative">
          Pending
          {pendingApps.length > 0 && (
            <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center" variant="destructive">
              {pendingApps.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="approved">Approved ({approvedApps.length})</TabsTrigger>
        <TabsTrigger value="rejected">Rejected ({rejectedApps.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="pending">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Pending Payment Verification Requests
            </CardTitle>
            <CardDescription>Students awaiting lab charge verification</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingApps.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No pending requests</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>USN</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{pendingApps.map((app) => renderRow(app))}</TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="approved">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Approved Payment Requests
            </CardTitle>
            <CardDescription>Successfully verified payment requests</CardDescription>
          </CardHeader>
          <CardContent>
            {approvedApps.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No approved requests</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>USN</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Approved On</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{approvedApps.map((app) => renderRow(app))}</TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="rejected">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Rejected Payment Requests
            </CardTitle>
            <CardDescription>Requests that need resubmission</CardDescription>
          </CardHeader>
          <CardContent>
            {rejectedApps.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No rejected requests</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>USN</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Rejected On</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{rejectedApps.map((app) => renderRow(app, true))}</TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
