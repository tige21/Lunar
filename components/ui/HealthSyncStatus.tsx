import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import sleepService from '@/lib/services/sleepService';

export interface HealthSyncStatusProps {
  onSyncPress?: () => void;
  showDetails?: boolean;
  compact?: boolean;
}

type SyncStatus = 'unknown' | 'syncing' | 'synced' | 'error' | 'unauthorized' | 'unavailable';

interface HealthKitStatus {
  isAvailable: boolean;
  authorizationStatus: 'notDetermined' | 'sharingDenied' | 'sharingAuthorized';
  permissions: Record<string, any>;
}

export function HealthSyncStatus({ 
  onSyncPress, 
  showDetails = true, 
  compact = false 
}: HealthSyncStatusProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('unknown');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [healthKitStatus, setHealthKitStatus] = useState<HealthKitStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    checkHealthKitStatus();
  }, []);

  const checkHealthKitStatus = async () => {
    if (Platform.OS !== 'ios') {
      setSyncStatus('unavailable');
      return;
    }

    try {
      const status = await sleepService.getHealthKitStatus();
      setHealthKitStatus(status);
      
      if (!status.isAvailable) {
        setSyncStatus('unavailable');
      } else if (status.authorizationStatus === 'sharingAuthorized') {
        setSyncStatus('synced');
        setLastSyncTime(new Date());
      } else if (status.authorizationStatus === 'sharingDenied') {
        setSyncStatus('unauthorized');
      } else {
        setSyncStatus('unknown');
      }
    } catch (error) {
      console.error('Failed to check HealthKit status:', error);
      setSyncStatus('error');
    }
  };

  const handleSyncPress = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setSyncStatus('syncing');

    try {
      if (syncStatus === 'unauthorized' || syncStatus === 'unknown') {
        // Request permissions first
        const granted = await sleepService.requestHealthKitPermissions();
        if (!granted) {
          setSyncStatus('unauthorized');
          return;
        }
      }

      // Perform sync
      const data = await sleepService.syncFromHealthKit();
      if (data) {
        setSyncStatus('synced');
        setLastSyncTime(new Date());
      } else {
        setSyncStatus('error');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
      onSyncPress?.();
    }
  };

  const getStatusInfo = () => {
    switch (syncStatus) {
      case 'syncing':
        return {
          icon: 'arrow.triangle.2.circlepath' as const,
          color: colors.tint,
          title: 'Синхронизация...',
          subtitle: 'Получение данных из Здоровья',
          showActivity: true,
        };
      case 'synced':
        return {
          icon: 'checkmark.circle.fill' as const,
          color: '#34C759',
          title: 'Синхронизировано',
          subtitle: lastSyncTime ? `${formatLastSync(lastSyncTime)}` : 'Данные актуальны',
          showActivity: false,
        };
      case 'error':
        return {
          icon: 'exclamationmark.triangle.fill' as const,
          color: '#FF3B30',
          title: 'Ошибка синхронизации',
          subtitle: 'Нажмите для повторной попытки',
          showActivity: false,
        };
      case 'unauthorized':
        return {
          icon: 'lock.fill' as const,
          color: '#FF9500',
          title: 'Нет доступа',
          subtitle: 'Разрешите доступ к Здоровью',
          showActivity: false,
        };
      case 'unavailable':
        return {
          icon: 'heart.slash' as const,
          color: colors.tabIconDefault,
          title: 'Недоступно',
          subtitle: 'HealthKit доступен только на iOS',
          showActivity: false,
        };
      default:
        return {
          icon: 'heart' as const,
          color: colors.tabIconDefault,
          title: 'Apple Здоровье',
          subtitle: 'Нажмите для подключения',
          showActivity: false,
        };
    }
  };

  const formatLastSync = (date: Date): string => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'только что';
    if (diffMinutes < 60) return `${diffMinutes} мин назад`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} ч назад`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} дн назад`;
  };

  const statusInfo = getStatusInfo();

  if (compact) {
    return (
      <TouchableOpacity
        onPress={handleSyncPress}
        disabled={isSyncing || syncStatus === 'unavailable'}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 8,
          backgroundColor: colors.background,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {statusInfo.showActivity ? (
          <ActivityIndicator size="small" color={statusInfo.color} />
        ) : (
          <IconSymbol
            name={statusInfo.icon}
            size={16}
            color={statusInfo.color}
          />
        )}
        <ThemedText style={{ 
          marginLeft: 6, 
          fontSize: 12, 
          fontWeight: '500',
          color: statusInfo.color 
        }}>
          {syncStatus === 'syncing' ? 'Синхронизация' : statusInfo.title}
        </ThemedText>
      </TouchableOpacity>
    );
  }

  return (
    <ThemedView
      style={{
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
      }}
    >
      <TouchableOpacity
        onPress={handleSyncPress}
        disabled={isSyncing || syncStatus === 'unavailable'}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: statusInfo.color + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}
        >
          {statusInfo.showActivity ? (
            <ActivityIndicator size="small" color={statusInfo.color} />
          ) : (
            <IconSymbol
              name={statusInfo.icon}
              size={22}
              color={statusInfo.color}
            />
          )}
        </View>

        <View style={{ flex: 1 }}>
          <ThemedText
            style={{
              fontSize: 16,
              fontWeight: '600',
              marginBottom: 2,
            }}
          >
            {statusInfo.title}
          </ThemedText>
          
          <ThemedText
            style={{
              fontSize: 13,
              opacity: 0.7,
            }}
          >
            {statusInfo.subtitle}
          </ThemedText>
        </View>

        {syncStatus !== 'unavailable' && syncStatus !== 'syncing' && (
          <IconSymbol
            name="chevron.right"
            size={16}
            color={colors.tabIconDefault}
          />
        )}
      </TouchableOpacity>

      {showDetails && healthKitStatus && syncStatus === 'synced' && (
        <View
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <ThemedText
            style={{
              fontSize: 12,
              opacity: 0.6,
              textAlign: 'center',
            }}
          >
            Доступ к данным сна • {healthKitStatus.isAvailable ? 'Разрешен' : 'Запрещен'}
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}