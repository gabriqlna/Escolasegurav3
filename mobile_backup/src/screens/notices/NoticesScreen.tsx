import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { noticesService } from '@/services/notices';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/types';
import { PRIORITY_LEVELS } from '@/constants/permissions';

const getPriorityColor = (priority: Notice['priority']) => {
  switch (priority) {
    case 'low': return '#34C759';
    case 'medium': return '#FF9500';
    case 'high': return '#FF3B30';
    case 'urgent': return '#AF52DE';
    default: return '#8E8E93';
  }
};

const getPriorityIcon = (priority: Notice['priority']) => {
  switch (priority) {
    case 'low': return 'information-circle';
    case 'medium': return 'warning';
    case 'high': return 'alert-circle';
    case 'urgent': return 'flash';
    default: return 'document';
  }
};

export default function NoticesScreen() {
  const { user, hasPermission } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const canCreateNotice = hasPermission('create_notice');
  const canManageNotices = hasPermission('manage_notices');

  useEffect(() => {
    loadNotices();
  }, [user]);

  const loadNotices = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let result;

      if (canManageNotices) {
        result = await noticesService.getAllNotices();
      } else {
        result = await noticesService.getNoticesForUser(user.role);
      }

      if (result.success && result.data) {
        setNotices(result.data);
      } else {
        Alert.alert('Erro', result.error || 'Erro ao carregar avisos');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro inesperado ao carregar avisos');
      console.error('Error loading notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotices();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (noticeId: string) => {
    if (!user) return;

    try {
      const result = await noticesService.markAsRead(noticeId, user.id);
      if (result.success) {
        // Atualizar o estado local
        setNotices(prevNotices =>
          prevNotices.map(notice =>
            notice.id === noticeId
              ? { ...notice, readBy: [...(notice.readBy || []), user.id] }
              : notice
          )
        );
      }
    } catch (error) {
      console.error('Error marking notice as read:', error);
    }
  };

  const handleDeactivateNotice = async (noticeId: string) => {
    if (!canManageNotices) return;

    Alert.alert(
      'Desativar Aviso',
      'Tem certeza que deseja desativar este aviso? Ele não será mais exibido para os usuários.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desativar',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await noticesService.deactivateNotice(noticeId);
              if (result.success) {
                await loadNotices();
              } else {
                Alert.alert('Erro', result.error || 'Erro ao desativar aviso');
              }
            } catch (error) {
              Alert.alert('Erro', 'Erro inesperado ao desativar aviso');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const isNoticeRead = (notice: Notice) => {
    return user && notice.readBy?.includes(user.id);
  };

  const renderNoticeCard = ({ item }: { item: Notice }) => {
    const isRead = isNoticeRead(item);
    const isExpired = item.expiresAt && item.expiresAt < new Date();

    return (
      <TouchableOpacity
        style={[
          styles.noticeCard,
          { borderLeftColor: getPriorityColor(item.priority) },
          isRead && styles.readNotice,
          isExpired && styles.expiredNotice
        ]}
        onPress={() => handleMarkAsRead(item.id)}
        data-testid={`card-notice-${item.id}`}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <View style={[styles.priorityIcon, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
              <Ionicons 
                name={getPriorityIcon(item.priority) as any} 
                size={20} 
                color={getPriorityColor(item.priority)} 
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, isRead && styles.readText]}>
                {item.title}
              </Text>
              <View style={styles.cardMeta}>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
                  <Text style={styles.priorityText}>
                    {PRIORITY_LEVELS[item.priority]}
                  </Text>
                </View>
                {!isRead && <View style={styles.unreadDot} />}
              </View>
            </View>
          </View>
        </View>

        <Text style={[styles.cardDescription, isRead && styles.readText]}>
          {item.content}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.cardInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="time" size={14} color="#8E8E93" />
              <Text style={styles.infoText}>{formatDate(item.createdAt)}</Text>
            </View>
            {item.expiresAt && (
              <View style={styles.infoItem}>
                <Ionicons name="calendar" size={14} color="#8E8E93" />
                <Text style={[styles.infoText, isExpired && styles.expiredText]}>
                  {isExpired ? 'Expirado' : `Expira: ${formatDate(item.expiresAt)}`}
                </Text>
              </View>
            )}
          </View>

          {canManageNotices && (
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeactivateNotice(item.id)}
                data-testid={`button-deactivate-${item.id}`}
              >
                <Ionicons name="close-circle" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="notifications-outline" size={64} color="#C7C7CC" />
      <Text style={styles.emptyTitle}>Nenhum aviso encontrado</Text>
      <Text style={styles.emptySubtitle}>
        {canManageNotices
          ? 'Não há avisos no sistema'
          : 'Não há avisos para você no momento'}
      </Text>
      {canCreateNotice && (
        <Button
          title="Criar Aviso"
          onPress={() => router.push('/notices/create' as any)}
          style={styles.emptyButton}
          data-testid="button-create-first-notice"
        />
      )}
    </View>
  );

  const urgentNotices = notices.filter(notice => notice.priority === 'urgent' && !isNoticeRead(notice));
  const otherNotices = notices.filter(notice => notice.priority !== 'urgent' || isNoticeRead(notice));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📢 Avisos</Text>
        <Text style={styles.subtitle}>
          {notices.length} {notices.length === 1 ? 'aviso' : 'avisos'}
          {urgentNotices.length > 0 && ` • ${urgentNotices.length} urgente${urgentNotices.length > 1 ? 's' : ''}`}
        </Text>
      </View>

      {urgentNotices.length > 0 && (
        <View style={styles.urgentSection}>
          <Text style={styles.urgentTitle}>⚡ Avisos Urgentes</Text>
          <FlatList
            data={urgentNotices}
            renderItem={renderNoticeCard}
            keyExtractor={(item) => `urgent-${item.id}`}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      )}

      <FlatList
        data={otherNotices}
        renderItem={renderNoticeCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          otherNotices.length === 0 && urgentNotices.length === 0 && styles.listContentEmpty
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={!loading && urgentNotices.length === 0 ? renderEmptyState : null}
      />

      {canCreateNotice && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/notices/create' as any)}
          data-testid="button-create-notice"
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  urgentSection: {
    backgroundColor: '#FFF5F5',
    borderTopWidth: 3,
    borderTopColor: '#AF52DE',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  urgentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#AF52DE',
    marginBottom: 12,
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  noticeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  readNotice: {
    backgroundColor: '#F8F9FA',
    opacity: 0.8,
  },
  expiredNotice: {
    opacity: 0.6,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  priorityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  readText: {
    color: '#8E8E93',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  cardDescription: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 22,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardInfo: {
    flex: 1,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  expiredText: {
    color: '#FF3B30',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  emptyButton: {
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});