import { supabase } from '@/lib/supabase';
import { CheckCircle2, XCircle, Info, AlertCircle, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export type NotificationType = 'approval' | 'rejection' | 'info' | 'warning' | 'success';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export const createNotification = async (params: CreateNotificationParams) => {
  const { data, error } = await (supabase as any)
    .from('notifications')
    .insert({
      user_id: params.userId,
      title: params.title,
      message: params.message,
      type: params.type,
      related_entity_type: params.relatedEntityType,
      related_entity_id: params.relatedEntityId
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating notification:', error);
    return null;
  }

  return data;
};

export const createBulkNotifications = async (notifications: CreateNotificationParams[]) => {
  const { data, error } = await (supabase as any)
    .from('notifications')
    .insert(
      notifications.map(n => ({
        user_id: n.userId,
        title: n.title,
        message: n.message,
        type: n.type,
        related_entity_type: n.relatedEntityType,
        related_entity_id: n.relatedEntityId
      }))
    );

  if (error) {
    console.error('Error creating bulk notifications:', error);
    return null;
  }

  return data;
};

export const formatNotificationTime = (date: string | Date) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return 'Recently';
  }
};

export const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
    case 'approval':
      return CheckCircle2;
    case 'rejection':
      return XCircle;
    case 'warning':
      return AlertCircle;
    case 'info':
    default:
      return Info;
  }
};

export const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'success':
    case 'approval':
      return 'text-success';
    case 'rejection':
      return 'text-destructive';
    case 'warning':
      return 'text-warning';
    case 'info':
    default:
      return 'text-primary';
  }
};

export const getNotificationBadgeVariant = (type: NotificationType): 'default' | 'destructive' | 'outline' | 'secondary' => {
  switch (type) {
    case 'success':
    case 'approval':
      return 'default';
    case 'rejection':
      return 'destructive';
    case 'warning':
      return 'secondary';
    case 'info':
    default:
      return 'outline';
  }
};
