import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationManagerProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRemove: (id: string) => void;
}

export function NotificationManager({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemove
}: NotificationManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      case 'info': 
      default: return Info;
    }
  };

  const getVariantClass = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      case 'info':
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}min atrás`;
    return 'Agora mesmo';
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-9 w-9 rounded-full"
        aria-label={`Notificações (${unreadCount} não lidas)`}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center animate-pulse"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Notification List */}
          <Card className="absolute right-0 top-12 z-50 w-80 max-h-96 overflow-hidden shadow-lg animate-in fade-in-0 slide-in-from-top-2 duration-200">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Notificações</h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onMarkAllAsRead();
                      setIsOpen(false);
                    }}
                    className="text-xs"
                  >
                    Marcar todas como lidas
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="absolute right-2 top-2 h-6 w-6"
                aria-label="Fechar notificações"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <CardContent className="p-0 max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {notifications.map((notification) => {
                    const Icon = getIcon(notification.type);
                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-3 border-b last:border-b-0 hover:bg-accent/50 transition-colors cursor-pointer",
                          !notification.read && "bg-accent/30"
                        )}
                        onClick={() => onMarkAsRead(notification.id)}
                        role="button"
                        tabIndex={0}
                        aria-label={`${notification.title}: ${notification.message}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            onMarkAsRead(notification.id);
                          }
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", getVariantClass(notification.type))} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={cn(
                                "text-sm font-medium truncate",
                                !notification.read && "font-semibold"
                              )}>
                                {notification.title}
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRemove(notification.id);
                                }}
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                                aria-label="Remover notificação"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(notification.timestamp)}
                              </span>
                              {!notification.read && (
                                <div className="h-2 w-2 bg-primary rounded-full"></div>
                              )}
                            </div>
                            {notification.action && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  notification.action!.onClick();
                                }}
                                className="mt-2 h-7 text-xs"
                              >
                                {notification.action.label}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}