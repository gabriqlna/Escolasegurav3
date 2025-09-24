import { useState, useEffect, useCallback } from 'react';

export interface Notification {
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

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Simular algumas notificações iniciais para demonstração
  useEffect(() => {
    const initialNotifications: Notification[] = [
      {
        id: '1',
        title: 'Sistema Atualizado',
        message: 'O sistema de segurança escolar foi atualizado com sucesso. Novas funcionalidades disponíveis.',
        type: 'success',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 min atrás
        read: false,
      },
      {
        id: '2',
        title: 'Relatório Pendente',
        message: 'Você tem 3 relatórios aguardando análise no sistema.',
        type: 'warning',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min atrás
        read: false,
        action: {
          label: 'Ver Relatórios',
          onClick: () => console.log('Navegar para relatórios'),
        },
      },
      {
        id: '3',
        title: 'Bem-vindo!',
        message: 'Bem-vindo ao sistema de segurança escolar. Explore as funcionalidades disponíveis.',
        type: 'info',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h atrás
        read: true,
      },
    ];

    setNotifications(initialNotifications);
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36),
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showSuccessNotification = useCallback((title: string, message: string, action?: Notification['action']) => {
    addNotification({ title, message, type: 'success', action });
  }, [addNotification]);

  const showErrorNotification = useCallback((title: string, message: string, action?: Notification['action']) => {
    addNotification({ title, message, type: 'error', action });
  }, [addNotification]);

  const showWarningNotification = useCallback((title: string, message: string, action?: Notification['action']) => {
    addNotification({ title, message, type: 'warning', action });
  }, [addNotification]);

  const showInfoNotification = useCallback((title: string, message: string, action?: Notification['action']) => {
    addNotification({ title, message, type: 'info', action });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    showSuccessNotification,
    showErrorNotification,
    showWarningNotification,
    showInfoNotification,
  };
}