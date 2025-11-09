import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { getNotificationIcon, getNotificationColor, formatNotificationTime } from "@/lib/notifications";
import { CheckCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface NotificationsPanelProps {
  onClose?: () => void;
  role?: string;
}

const NotificationsPanel = ({ onClose, role }: NotificationsPanelProps) => {
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();
  const { userRoles } = useAuth();
  
  const getRoleSpecificNotifications = () => {
    if (!role || !notifications || notifications.length === 0) return notifications;
    
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

  const filteredNotifications = getRoleSpecificNotifications();
  const recentNotifications = filteredNotifications.slice(0, 10);

  // Determine notifications route based on user role or role prop
  const getNotificationsRoute = () => {
    const effectiveRole = role || (userRoles && userRoles.length > 0 ? userRoles[0] : null);
    
    if (!effectiveRole) return '/admin/notifications';
    
    switch (effectiveRole.toLowerCase()) {
      case 'student':
        return '/student/notifications';
      case 'library':
        return '/library/notifications';
      case 'hostel':
        return '/hostel/notifications';
      case 'lab_instructor':
        return '/lab-instructor/notifications';
      case 'college_office':
        return '/college-office/notifications';
      case 'faculty':
        return '/faculty/notifications';
      case 'hod':
        return '/hod/notifications';
      case 'counsellor':
        return '/counsellor/notifications';
      case 'class_advisor':
        return '/class-advisor/notifications';
      default:
        return '/admin/notifications';
    }
  };

  const handleNotificationClick = (id: string, read: boolean) => {
    if (!read) {
      markAsRead(id);
    }
  };

  return (
    <div className="w-80 sm:w-96">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-lg">Notifications</h3>
        {recentNotifications.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={markAllAsRead}
            className="text-xs"
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      <ScrollArea className="h-[400px]">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading notifications...
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No notifications yet</p>
            <p className="text-sm mt-2">We'll notify you when something important happens</p>
          </div>
        ) : (
          <div className="p-2">
            {recentNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(notification.type);
              
              return (
                <div
                  key={notification.id}
                  className={`p-3 rounded-md cursor-pointer transition-colors hover:bg-accent/50 ${
                    !notification.read ? 'bg-accent/30' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification.id, notification.read)}
                >
                  <div className="flex gap-3">
                    <Icon className={`h-5 w-5 ${colorClass} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm line-clamp-1">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatNotificationTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {recentNotifications.length > 0 && (
        <>
          <Separator />
          <div className="p-2">
            <Button 
              variant="ghost" 
              className="w-full" 
              asChild
              onClick={onClose}
            >
              <Link to={getNotificationsRoute()}>
                View all notifications
              </Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsPanel;
