/**
 * AI-specific database operations for Lunar Sleep Analysis App
 * Handles AI chat interactions, conversation history, and recommendations
 */

import { database } from './database';
import type {
  AIInteractionRow,
  DatabaseResult,
  QueryOptions
} from './types';
import { generateId } from '../utils/id';

export interface AIInteraction {
  id: string;
  userId: string;
  conversationId: string;
  type: 'question' | 'answer' | 'recommendation' | 'insight';
  content: string;
  metadata?: Record<string, any>;
  contextSessionIds?: string[];
  rating?: 1 | 2 | 3 | 4 | 5;
  isHelpful?: boolean;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  title?: string;
  interactions: AIInteraction[];
  lastActivity: Date;
  createdAt: Date;
}

export interface AIInsightData {
  type: 'sleep_pattern' | 'quality_improvement' | 'goal_progress' | 'health_recommendation';
  confidence: number; // 0-100
  dataPoints: string[];
  recommendations: string[];
}

export class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // === AI INTERACTIONS ===

  /**
   * Create a new AI interaction
   */
  async createInteraction(
    userId: string = 'default_user',
    conversationId: string,
    interaction: Omit<AIInteraction, 'id' | 'userId' | 'conversationId' | 'createdAt'>
  ): Promise<DatabaseResult<string>> {
    try {
      const interactionId = generateId();

      const result = await database.executeUpdate(`
        INSERT INTO ai_interactions (
          id, user_id, conversation_id, type, content, metadata,
          context_session_ids, rating, is_helpful
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        interactionId,
        userId,
        conversationId,
        interaction.type,
        interaction.content,
        interaction.metadata ? JSON.stringify(interaction.metadata) : null,
        interaction.contextSessionIds?.join(',') || null,
        interaction.rating || null,
        interaction.isHelpful !== undefined ? (interaction.isHelpful ? 1 : 0) : null
      ]);

      if (!result.success) {
        return result;
      }

      return { success: true, data: interactionId };

    } catch (error) {
      console.error('[AIService] Failed to create interaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get AI interaction by ID
   */
  async getInteraction(interactionId: string): Promise<DatabaseResult<AIInteraction | null>> {
    try {
      const result = await database.executeQueryFirst<AIInteractionRow>(`
        SELECT * FROM ai_interactions WHERE id = ?
      `, [interactionId]);

      if (!result.success) {
        return result;
      }

      if (!result.data) {
        return { success: true, data: null };
      }

      const interaction = this.mapRowToInteraction(result.data);
      return { success: true, data: interaction };

    } catch (error) {
      console.error('[AIService] Failed to get interaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update AI interaction (mainly for rating/feedback)
   */
  async updateInteraction(
    interactionId: string,
    updates: {
      rating?: 1 | 2 | 3 | 4 | 5;
      isHelpful?: boolean;
      metadata?: Record<string, any>;
    }
  ): Promise<DatabaseResult<void>> {
    try {
      const setClauses: string[] = [];
      const params: any[] = [];

      if (updates.rating !== undefined) {
        setClauses.push('rating = ?');
        params.push(updates.rating);
      }

      if (updates.isHelpful !== undefined) {
        setClauses.push('is_helpful = ?');
        params.push(updates.isHelpful ? 1 : 0);
      }

      if (updates.metadata !== undefined) {
        setClauses.push('metadata = ?');
        params.push(JSON.stringify(updates.metadata));
      }

      if (setClauses.length === 0) {
        return { success: true };
      }

      params.push(interactionId);

      const result = await database.executeUpdate(`
        UPDATE ai_interactions 
        SET ${setClauses.join(', ')}
        WHERE id = ?
      `, params);

      return result.success ? { success: true } : result;

    } catch (error) {
      console.error('[AIService] Failed to update interaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === CONVERSATIONS ===

  /**
   * Start a new conversation
   */
  async startConversation(
    userId: string = 'default_user',
    title?: string
  ): Promise<DatabaseResult<string>> {
    try {
      const conversationId = generateId();
      
      // Create initial system message to establish conversation
      await this.createInteraction(userId, conversationId, {
        type: 'insight',
        content: title || 'New conversation started',
        metadata: {
          isSystemMessage: true,
          conversationTitle: title
        }
      });

      return { success: true, data: conversationId };

    } catch (error) {
      console.error('[AIService] Failed to start conversation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get conversation with all interactions
   */
  async getConversation(conversationId: string): Promise<DatabaseResult<Conversation | null>> {
    try {
      const result = await database.executeQuery<AIInteractionRow>(`
        SELECT * FROM ai_interactions 
        WHERE conversation_id = ? 
        ORDER BY created_at ASC
      `, [conversationId]);

      if (!result.success) {
        return result;
      }

      if (!result.data || result.data.length === 0) {
        return { success: true, data: null };
      }

      const interactions = result.data.map(row => this.mapRowToInteraction(row));
      const firstInteraction = interactions[0];
      const lastInteraction = interactions[interactions.length - 1];

      const conversation: Conversation = {
        id: conversationId,
        userId: firstInteraction.userId,
        title: firstInteraction.metadata?.conversationTitle,
        interactions,
        lastActivity: lastInteraction.createdAt,
        createdAt: firstInteraction.createdAt
      };

      return { success: true, data: conversation };

    } catch (error) {
      console.error('[AIService] Failed to get conversation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get all conversations for a user
   */
  async getConversations(
    userId: string = 'default_user',
    options: QueryOptions = {}
  ): Promise<DatabaseResult<Conversation[]>> {
    try {
      // Get conversation IDs with latest interaction timestamp
      const orderBy = options.orderBy || 'last_activity';
      const orderDirection = options.orderDirection || 'DESC';
      
      let limitClause = '';
      if (options.limit) {
        limitClause += ` LIMIT ${options.limit}`;
        if (options.offset) {
          limitClause += ` OFFSET ${options.offset}`;
        }
      }

      const conversationsResult = await database.executeQuery<{
        conversation_id: string;
        last_activity: number;
        interaction_count: number;
      }>(`
        SELECT 
          conversation_id,
          MAX(created_at) as last_activity,
          COUNT(*) as interaction_count
        FROM ai_interactions 
        WHERE user_id = ? 
        GROUP BY conversation_id 
        ORDER BY last_activity ${orderDirection}
        ${limitClause}
      `, [userId]);

      if (!conversationsResult.success || !conversationsResult.data) {
        return { success: false, error: conversationsResult.error };
      }

      // Get full conversation data for each
      const conversations = await Promise.all(
        conversationsResult.data.map(async (row) => {
          const convResult = await this.getConversation(row.conversation_id);
          return convResult.data;
        })
      );

      // Filter out null results
      const validConversations = conversations.filter(conv => conv !== null) as Conversation[];

      return { success: true, data: validConversations };

    } catch (error) {
      console.error('[AIService] Failed to get conversations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete a conversation and all its interactions
   */
  async deleteConversation(conversationId: string): Promise<DatabaseResult<void>> {
    try {
      const result = await database.executeUpdate(`
        DELETE FROM ai_interactions WHERE conversation_id = ?
      `, [conversationId]);

      return result.success ? { success: true } : result;

    } catch (error) {
      console.error('[AIService] Failed to delete conversation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === SEARCH & ANALYTICS ===

  /**
   * Search interactions by content
   */
  async searchInteractions(
    userId: string = 'default_user',
    query: string,
    options: QueryOptions = {}
  ): Promise<DatabaseResult<AIInteraction[]>> {
    try {
      const limit = options.limit || 20;
      const offset = options.offset || 0;

      const result = await database.executeQuery<AIInteractionRow>(`
        SELECT * FROM ai_interactions 
        WHERE user_id = ? AND content LIKE ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `, [userId, `%${query}%`, limit, offset]);

      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }

      const interactions = result.data.map(row => this.mapRowToInteraction(row));
      return { success: true, data: interactions };

    } catch (error) {
      console.error('[AIService] Failed to search interactions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get interaction statistics
   */
  async getInteractionStats(userId: string = 'default_user'): Promise<DatabaseResult<{
    totalInteractions: number;
    totalConversations: number;
    averageRating: number;
    helpfulPercentage: number;
    typeBreakdown: Record<string, number>;
  }>> {
    try {
      const [totalResult, conversationsResult, ratingsResult, helpfulResult, typesResult] = await Promise.all([
        database.executeQueryFirst<{ count: number }>(`
          SELECT COUNT(*) as count FROM ai_interactions WHERE user_id = ?
        `, [userId]),
        
        database.executeQueryFirst<{ count: number }>(`
          SELECT COUNT(DISTINCT conversation_id) as count FROM ai_interactions WHERE user_id = ?
        `, [userId]),
        
        database.executeQueryFirst<{ avg_rating: number }>(`
          SELECT AVG(rating) as avg_rating FROM ai_interactions 
          WHERE user_id = ? AND rating IS NOT NULL
        `, [userId]),
        
        database.executeQuery<{ is_helpful: number; count: number }>(`
          SELECT is_helpful, COUNT(*) as count FROM ai_interactions 
          WHERE user_id = ? AND is_helpful IS NOT NULL 
          GROUP BY is_helpful
        `, [userId]),
        
        database.executeQuery<{ type: string; count: number }>(`
          SELECT type, COUNT(*) as count FROM ai_interactions 
          WHERE user_id = ? 
          GROUP BY type
        `, [userId])
      ]);

      const totalInteractions = totalResult.data?.count || 0;
      const totalConversations = conversationsResult.data?.count || 0;
      const averageRating = ratingsResult.data?.avg_rating || 0;

      // Calculate helpful percentage
      let helpfulPercentage = 0;
      if (helpfulResult.success && helpfulResult.data) {
        const helpfulCounts = helpfulResult.data.reduce((acc, row) => {
          acc[row.is_helpful ? 'helpful' : 'not_helpful'] = row.count;
          return acc;
        }, { helpful: 0, not_helpful: 0 });
        
        const total = helpfulCounts.helpful + helpfulCounts.not_helpful;
        if (total > 0) {
          helpfulPercentage = (helpfulCounts.helpful / total) * 100;
        }
      }

      // Type breakdown
      const typeBreakdown: Record<string, number> = {};
      if (typesResult.success && typesResult.data) {
        typesResult.data.forEach(row => {
          typeBreakdown[row.type] = row.count;
        });
      }

      return {
        success: true,
        data: {
          totalInteractions,
          totalConversations,
          averageRating: Math.round(averageRating * 10) / 10,
          helpfulPercentage: Math.round(helpfulPercentage * 10) / 10,
          typeBreakdown
        }
      };

    } catch (error) {
      console.error('[AIService] Failed to get interaction stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get recent AI recommendations
   */
  async getRecentRecommendations(
    userId: string = 'default_user',
    days: number = 7,
    limit: number = 10
  ): Promise<DatabaseResult<AIInteraction[]>> {
    try {
      const cutoffDate = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000);

      const result = await database.executeQuery<AIInteractionRow>(`
        SELECT * FROM ai_interactions 
        WHERE user_id = ? AND type = 'recommendation' AND created_at >= ?
        ORDER BY created_at DESC 
        LIMIT ?
      `, [userId, cutoffDate, limit]);

      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }

      const recommendations = result.data.map(row => this.mapRowToInteraction(row));
      return { success: true, data: recommendations };

    } catch (error) {
      console.error('[AIService] Failed to get recent recommendations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === CLEANUP ===

  /**
   * Clean up old AI interactions based on retention policy
   */
  async cleanupOldInteractions(
    userId: string = 'default_user',
    retentionDays: number = 365
  ): Promise<DatabaseResult<number>> {
    try {
      const cutoffDate = Math.floor((Date.now() - retentionDays * 24 * 60 * 60 * 1000) / 1000);

      const result = await database.executeUpdate(`
        DELETE FROM ai_interactions 
        WHERE user_id = ? AND created_at < ?
      `, [userId, cutoffDate]);

      return {
        success: true,
        data: result.rowsAffected || 0
      };

    } catch (error) {
      console.error('[AIService] Failed to cleanup old interactions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === UTILITY METHODS ===

  /**
   * Map database row to AIInteraction object
   */
  private mapRowToInteraction(row: AIInteractionRow): AIInteraction {
    return {
      id: row.id,
      userId: row.user_id,
      conversationId: row.conversation_id,
      type: row.type,
      content: row.content,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      contextSessionIds: row.context_session_ids ? row.context_session_ids.split(',') : undefined,
      rating: row.rating,
      isHelpful: row.is_helpful !== null ? Boolean(row.is_helpful) : undefined,
      createdAt: new Date(row.created_at * 1000)
    };
  }

  /**
   * Create AI insight interaction
   */
  async createInsightInteraction(
    userId: string = 'default_user',
    conversationId: string,
    insightData: AIInsightData,
    contextSessionIds?: string[]
  ): Promise<DatabaseResult<string>> {
    const content = this.generateInsightContent(insightData);
    
    return this.createInteraction(userId, conversationId, {
      type: 'insight',
      content,
      metadata: {
        insightType: insightData.type,
        confidence: insightData.confidence,
        dataPoints: insightData.dataPoints,
        recommendations: insightData.recommendations
      },
      contextSessionIds
    });
  }

  /**
   * Generate human-readable insight content
   */
  private generateInsightContent(insightData: AIInsightData): string {
    const { type, confidence, recommendations } = insightData;

    const confidenceText = confidence >= 80 ? 'high confidence' : 
                          confidence >= 60 ? 'moderate confidence' : 'low confidence';

    let content = '';

    switch (type) {
      case 'sleep_pattern':
        content = `I've identified a sleep pattern with ${confidenceText}. ${recommendations[0] || 'Consider maintaining consistency in your sleep schedule.'}`;
        break;
      case 'quality_improvement':
        content = `Based on your recent sleep data, I have suggestions to improve your sleep quality (${confidenceText}). ${recommendations[0] || 'Focus on creating a better sleep environment.'}`;
        break;
      case 'goal_progress':
        content = `Here's an update on your sleep goal progress with ${confidenceText}. ${recommendations[0] || 'You\'re making good progress!'}`;
        break;
      case 'health_recommendation':
        content = `I have a health-related sleep recommendation based on your data (${confidenceText}). ${recommendations[0] || 'Consider consulting with a healthcare provider.'}`;
        break;
      default:
        content = `I have some insights about your sleep with ${confidenceText}. ${recommendations[0] || 'Check your recent sleep trends.'}`;
    }

    return content;
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();