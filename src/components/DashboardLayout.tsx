import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import NotificationsPanel from "@/components/NotificationsPanel";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  role: string;
  userName?: string;
}

const DashboardLayout = ({ children, title, role, userName = "User" }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { notifications, unreadCount } = useNotifications();

  const getRoleSpecificNotifications = () => {
    if (!notifications || notifications.length === 0) return [];
    
    return notifications.filter(n => {
      const titleLower = n.title?.toLowerCase() || '';
      const messageLower = n.message?.toLowerCase() || '';
      
      switch(role) {
        case 'counsellor':
          return titleLower.includes('counsellor') && 
                 (titleLower.includes('ready for') || titleLower.includes('verification'));
        
        case 'class_advisor':
          return titleLower.includes('class advisor') && 
                 (titleLower.includes('ready for') || titleLower.includes('verification'));
        
        case 'faculty':
          return (titleLower.includes('faculty') || messageLower.includes('faculty')) && 
                 !titleLower.includes('counsellor') && 
                 !titleLower.includes('class advisor');
        
        case 'hod':
          return titleLower.includes('hod') || messageLower.includes('hod');
        
        case 'library':
          return titleLower.includes('library') || messageLower.includes('library');
        
        case 'hostel':
          return titleLower.includes('hostel') || messageLower.includes('hostel');
        
        case 'lab_instructor':
          return titleLower.includes('lab') || messageLower.includes('lab');
        
        case 'college_office':
          return titleLower.includes('college office') || messageLower.includes('college office');
        
        default:
          return true; // Show all for admin/student
      }
    });
  };

  const roleSpecificNotifications = getRoleSpecificNotifications();
  const roleSpecificUnreadCount = roleSpecificNotifications.filter(n => !n.read).length;

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Nodex</h1>
                <p className="text-xs text-muted-foreground">{title}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {roleSpecificUnreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {roleSpecificUnreadCount > 9 ? '9+' : roleSpecificUnreadCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="p-0 w-auto">
                  <NotificationsPanel role={role} />
                </PopoverContent>
              </Popover>
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-foreground">{userName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{role.replace('_', ' ')}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
