/**
 * Chat Performance Optimization Utilities
 * Handles memory management, network optimization, and mobile-specific improvements
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'insight' | 'recommendation' | 'question';
  status?: 'sending' | 'sent' | 'error';
  retryCount?: number;
}

// Performance constants
export const PERFORMANCE_CONFIG = {
  MAX_MESSAGES_IN_MEMORY: Platform.OS === 'ios' ? 150 : 100,
  MESSAGE_BATCH_SIZE: 25,
  PAGINATION_THRESHOLD: 10,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_BASE_DELAY: 1000,
  MAX_RETRY_DELAY: 10000,
  STORAGE_COMPRESSION_THRESHOLD: 50,
  ANIMATION_DURATION: Platform.OS === 'ios' ? 250 : 200,
  SCROLL_THROTTLE: 16, // 60fps
  DEBOUNCE_DELAY: 100,
};

/**
 * Advanced Message Cache with LRU eviction and compression
 */
export class OptimizedMessageCache {
  private cache = new Map<string, ChatMessage>();
  private accessOrder: string[] = [];
  private maxSize: number;
  private compressionEnabled: boolean;

  constructor(maxSize = PERFORMANCE_CONFIG.MAX_MESSAGES_IN_MEMORY) {
    this.maxSize = maxSize;
    this.compressionEnabled = Platform.OS === 'android'; // More aggressive on Android
  }

  set(message: ChatMessage): void {
    if (this.cache.has(message.id)) {
      this.updateAccessOrder(message.id);
    } else {
      if (this.cache.size >= this.maxSize) {
        this.evictLeastRecent();
      }
      this.accessOrder.push(message.id);
    }
    
    // Compress long messages if enabled
    const optimizedMessage = this.compressionEnabled 
      ? this.compressMessage(message) 
      : message;
    
    this.cache.set(message.id, optimizedMessage);
  }

  get(id: string): ChatMessage | undefined {
    const message = this.cache.get(id);
    if (message) {
      this.updateAccessOrder(id);
      return this.compressionEnabled ? this.decompressMessage(message) : message;
    }
    return undefined;
  }

  getAll(): ChatMessage[] {
    return Array.from(this.cache.values())
      .map(msg => this.compressionEnabled ? this.decompressMessage(msg) : msg)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  getRecent(count: number): ChatMessage[] {
    const all = this.getAll();
    return all.slice(-count);
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  getSize(): number {
    return this.cache.size;
  }

  getMemoryUsage(): number {
    // Rough estimate of memory usage in bytes
    let usage = 0;
    this.cache.forEach(message => {
      usage += JSON.stringify(message).length * 2; // UTF-16 encoding
    });
    return usage;
  }

  private updateAccessOrder(id: string): void {
    const index = this.accessOrder.indexOf(id);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(id);
  }

  private evictLeastRecent(): void {
    const lruId = this.accessOrder.shift();
    if (lruId) {
      this.cache.delete(lruId);
    }
  }

  private compressMessage(message: ChatMessage): ChatMessage {
    // Simple compression for long messages
    if (message.text.length > PERFORMANCE_CONFIG.STORAGE_COMPRESSION_THRESHOLD) {
      return {
        ...message,
        text: this.simpleCompress(message.text),
      };
    }
    return message;
  }

  private decompressMessage(message: ChatMessage): ChatMessage {
    if (this.isCompressed(message.text)) {
      return {
        ...message,
        text: this.simpleDecompress(message.text),
      };
    }
    return message;
  }

  private simpleCompress(text: string): string {
    // Simple compression - replace common patterns
    return text
      .replace(/\n\n/g, '§n§')
      .replace(/• /g, '§b§')
      .replace(/\*\*/g, '§s§');
  }

  private simpleDecompress(text: string): string {
    return text
      .replace(/§n§/g, '\n\n')
      .replace(/§b§/g, '• ')
      .replace(/§s§/g, '**');
  }

  private isCompressed(text: string): boolean {
    return text.includes('§n§') || text.includes('§b§') || text.includes('§s§');
  }
}

/**
 * Retry Manager with exponential backoff and network awareness
 */
export class RetryManager {
  private retryQueue = new Map<string, {
    message: ChatMessage;
    retryCount: number;
    nextRetryTime: number;
  }>();
  
  private retryTimeouts = new Map<string, NodeJS.Timeout>();
  
  addToRetryQueue(message: ChatMessage): void {
    const retryCount = (message.retryCount || 0) + 1;
    const delay = Math.min(
      PERFORMANCE_CONFIG.RETRY_BASE_DELAY * Math.pow(2, retryCount - 1),
      PERFORMANCE_CONFIG.MAX_RETRY_DELAY
    );
    
    this.retryQueue.set(message.id, {
      message: { ...message, retryCount },
      retryCount,
      nextRetryTime: Date.now() + delay,
    });
  }

  scheduleRetry(messageId: string, retryCallback: (message: ChatMessage) => void): void {
    const retryData = this.retryQueue.get(messageId);
    if (!retryData || retryData.retryCount >= PERFORMANCE_CONFIG.MAX_RETRY_ATTEMPTS) {
      this.retryQueue.delete(messageId);
      return;
    }

    const delay = Math.max(0, retryData.nextRetryTime - Date.now());
    
    const timeout = setTimeout(() => {
      const currentRetryData = this.retryQueue.get(messageId);
      if (currentRetryData) {
        retryCallback(currentRetryData.message);
        this.retryQueue.delete(messageId);
      }
      this.retryTimeouts.delete(messageId);
    }, delay);

    this.retryTimeouts.set(messageId, timeout);
  }

  cancelRetry(messageId: string): void {
    const timeout = this.retryTimeouts.get(messageId);
    if (timeout) {
      clearTimeout(timeout);
      this.retryTimeouts.delete(messageId);
    }
    this.retryQueue.delete(messageId);
  }

  getQueuedRetries(): string[] {
    return Array.from(this.retryQueue.keys());
  }

  clearAll(): void {
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.clear();
    this.retryQueue.clear();
  }
}

/**
 * Optimized Storage Manager with batching and compression
 */
export class ChatStorageManager {
  private static readonly STORAGE_KEY = 'lunar_chat_history_v2';
  private static readonly METADATA_KEY = 'lunar_chat_metadata_v2';
  
  private pendingWrites = new Set<string>();
  private writeTimeout?: NodeJS.Timeout;

  async loadMessages(offset = 0, limit = PERFORMANCE_CONFIG.MESSAGE_BATCH_SIZE): Promise<{
    messages: ChatMessage[];
    hasMore: boolean;
    total: number;
  }> {
    try {
      const [storedMessages, metadata] = await Promise.all([
        AsyncStorage.getItem(ChatStorageManager.STORAGE_KEY),
        AsyncStorage.getItem(ChatStorageManager.METADATA_KEY),
      ]);

      if (!storedMessages) {
        return { messages: [], hasMore: false, total: 0 };
      }

      const allMessages: any[] = JSON.parse(storedMessages);
      const total = allMessages.length;
      
      // Apply pagination
      const startIndex = Math.max(0, total - limit - offset);
      const endIndex = total - offset;
      const paginatedMessages = allMessages.slice(startIndex, endIndex);

      const messages = paginatedMessages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));

      return {
        messages,
        hasMore: startIndex > 0,
        total,
      };
    } catch (error) {
      console.error('Error loading messages:', error);
      return { messages: [], hasMore: false, total: 0 };
    }
  }

  async saveMessages(messages: ChatMessage[]): Promise<void> {
    // Implement batched writing to avoid frequent storage operations
    return new Promise((resolve, reject) => {
      this.pendingWrites.add('messages');
      
      if (this.writeTimeout) {
        clearTimeout(this.writeTimeout);
      }

      this.writeTimeout = setTimeout(async () => {
        try {
          // Limit stored messages to prevent storage bloat
          const messagesToStore = messages.slice(-PERFORMANCE_CONFIG.MAX_MESSAGES_IN_MEMORY);
          
          await Promise.all([
            AsyncStorage.setItem(ChatStorageManager.STORAGE_KEY, JSON.stringify(messagesToStore)),
            AsyncStorage.setItem(ChatStorageManager.METADATA_KEY, JSON.stringify({
              lastUpdate: Date.now(),
              messageCount: messagesToStore.length,
              version: 2,
            })),
          ]);
          
          this.pendingWrites.delete('messages');
          resolve();
        } catch (error) {
          console.error('Error saving messages:', error);
          this.pendingWrites.delete('messages');
          reject(error);
        }
      }, PERFORMANCE_CONFIG.DEBOUNCE_DELAY);
    });
  }

  async clearHistory(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(ChatStorageManager.STORAGE_KEY),
        AsyncStorage.removeItem(ChatStorageManager.METADATA_KEY),
      ]);
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw error;
    }
  }

  hasPendingWrites(): boolean {
    return this.pendingWrites.size > 0;
  }
}

/**
 * Performance Monitor for chat operations
 */
export class ChatPerformanceMonitor {
  private metrics = {
    messageRenderTime: [] as number[],
    scrollPerformance: [] as number[],
    memoryUsage: [] as number[],
    networkLatency: [] as number[],
  };

  private startTimes = new Map<string, number>();

  startTimer(operation: string): void {
    this.startTimes.set(operation, Date.now());
  }

  endTimer(operation: string): number {
    const startTime = this.startTimes.get(operation);
    if (!startTime) return 0;
    
    const duration = Date.now() - startTime;
    this.startTimes.delete(operation);
    
    // Store metrics based on operation type
    if (operation.includes('render')) {
      this.metrics.messageRenderTime.push(duration);
    } else if (operation.includes('scroll')) {
      this.metrics.scrollPerformance.push(duration);
    } else if (operation.includes('network')) {
      this.metrics.networkLatency.push(duration);
    }
    
    // Keep only recent metrics
    Object.keys(this.metrics).forEach(key => {
      const metricArray = this.metrics[key as keyof typeof this.metrics];
      if (metricArray.length > 100) {
        metricArray.splice(0, metricArray.length - 100);
      }
    });
    
    return duration;
  }

  recordMemoryUsage(usage: number): void {
    this.metrics.memoryUsage.push(usage);
    if (this.metrics.memoryUsage.length > 50) {
      this.metrics.memoryUsage.shift();
    }
  }

  getAverageRenderTime(): number {
    const times = this.metrics.messageRenderTime;
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  getPerformanceReport(): {
    avgRenderTime: number;
    avgScrollTime: number;
    avgNetworkLatency: number;
    avgMemoryUsage: number;
    recommendations: string[];
  } {
    const avgRenderTime = this.getAverageRenderTime();
    const avgScrollTime = this.metrics.scrollPerformance.reduce((a, b) => a + b, 0) / 
                         (this.metrics.scrollPerformance.length || 1);
    const avgNetworkLatency = this.metrics.networkLatency.reduce((a, b) => a + b, 0) / 
                             (this.metrics.networkLatency.length || 1);
    const avgMemoryUsage = this.metrics.memoryUsage.reduce((a, b) => a + b, 0) / 
                          (this.metrics.memoryUsage.length || 1);

    const recommendations: string[] = [];
    
    if (avgRenderTime > 50) {
      recommendations.push('Consider reducing message complexity or enabling more aggressive caching');
    }
    
    if (avgScrollTime > 100) {
      recommendations.push('Optimize scroll performance by reducing rendered items');
    }
    
    if (avgMemoryUsage > 50 * 1024 * 1024) { // 50MB
      recommendations.push('Enable message compression or reduce cache size');
    }
    
    if (avgNetworkLatency > 2000) {
      recommendations.push('Implement more aggressive retry policies');
    }

    return {
      avgRenderTime,
      avgScrollTime,
      avgNetworkLatency,
      avgMemoryUsage,
      recommendations,
    };
  }
}

/**
 * Debounce utility for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle utility for scroll events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}