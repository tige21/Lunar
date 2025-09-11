# AI Chat Interface for Lunar Sleep App

## Overview

The AI chat interface provides users with a conversational way to interact with their sleep data, get personalized insights, and receive recommendations for better sleep. The implementation includes sophisticated components for a native mobile chat experience.

## Key Features

### 🤖 Intelligent AI Responses
- **Context-aware responses** based on user's sleep patterns
- **Personalized recommendations** using sleep data analysis
- **Smart categorization** of message types (insights, recommendations, questions)
- **Fallback responses** for offline scenarios

### 💬 Native Chat Experience
- **Message bubbles** with proper styling for user vs AI messages
- **Typing indicators** with realistic animated dots
- **Auto-scrolling** chat history with smooth animations
- **Message timestamps** and type indicators
- **Pull-to-refresh** for chat history

### 🎯 Smart Interactions
- **Quick suggestions** for common sleep-related questions
- **Smart replies** that appear after AI responses with contextual follow-ups
- **Haptic feedback** on message sending and interactions
- **Voice input support** (placeholder for future implementation)

### 📱 Mobile-Optimized UX
- **Keyboard handling** with proper scrolling behavior
- **Responsive design** for different screen sizes
- **Smooth animations** for message appearance
- **Error handling** with user-friendly messages
- **Persistent chat history** using AsyncStorage

## Component Architecture

### Core Components

#### `ChatBubble`
```typescript
interface ChatBubbleProps {
  message: ChatMessage;
  onLongPress?: () => void;
}
```
- Renders individual chat messages with proper styling
- Supports message types with visual indicators
- Handles user vs AI message differentiation
- Includes timestamp formatting

#### `TypingIndicator`
```typescript
interface TypingIndicatorProps {
  isVisible: boolean;
  aiName?: string;
}
```
- Animated typing dots when AI is responding
- Smooth fade in/out animations
- Configurable AI name display

#### `QuickSuggestions`
```typescript
interface QuickSuggestionsProps {
  suggestions: QuickSuggestion[];
  onSuggestionPress: (suggestion: QuickSuggestion) => void;
  isVisible?: boolean;
}
```
- Displays common questions as interactive buttons
- Categorized suggestions (analysis, improvement, routine, troubleshooting)
- Horizontal scrolling layout for mobile

#### `SmartReplies`
```typescript
interface SmartRepliesProps {
  replies: SmartReply[];
  onReplyPress: (reply: SmartReply) => void;
  isVisible?: boolean;
}
```
- Context-aware follow-up questions
- Generated based on last AI message content
- Quick interaction for common user responses

### AI Service

#### `SleepAIService`
```typescript
class SleepAIService {
  async generateResponse(userMessage: string): Promise<{
    text: string;
    type: 'insight' | 'recommendation' | 'question' | 'text';
    confidence: number;
  }>
}
```
- Singleton service for AI response generation
- Context awareness with user sleep data
- Intent analysis and categorization
- Extensible for real API integration

## Usage Examples

### Basic Implementation
```typescript
import { sleepAI } from '@/lib/chatAI';

// Update AI context with user data
sleepAI.updateContext({
  recentSleepData: userSleepData,
  userProfile: {
    chronotype: 'intermediate',
    sleepGoal: 8,
  }
});

// Generate response
const response = await sleepAI.generateResponse(userMessage);
```

### Custom Quick Suggestions
```typescript
const customSuggestions: QuickSuggestion[] = [
  {
    id: '1',
    text: 'How was my sleep quality?',
    icon: 'moon.fill',
    category: 'analysis'
  },
  // ... more suggestions
];

<QuickSuggestions
  suggestions={customSuggestions}
  onSuggestionPress={handleSuggestion}
/>
```

## Customization

### Adding New Message Types
1. Update the `ChatMessage` interface:
```typescript
interface ChatMessage {
  // ... existing fields
  type?: 'text' | 'insight' | 'recommendation' | 'question' | 'custom';
}
```

2. Add handling in `ChatBubble` component:
```typescript
const getTypeIcon = (type?: string) => {
  switch (type) {
    case 'custom':
      return 'custom.icon';
    // ... existing cases
  }
};
```

### Extending AI Responses
Add new response patterns in `SleepAIService`:
```typescript
private generateContextualResponse(intent, message) {
  switch (intent.category) {
    case 'newCategory':
      return this.generateNewCategoryResponse();
    // ... existing cases
  }
}
```

### Custom Styling
Override component styles by extending the base theme:
```typescript
const customChatTheme = {
  ...defaultTheme,
  chatBubble: {
    user: { backgroundColor: '#customColor' },
    ai: { backgroundColor: '#anotherColor' }
  }
};
```

## Integration with Real AI APIs

### OpenAI Integration Example
```typescript
class OpenAISleepService extends SleepAIService {
  async generateResponse(userMessage: string) {
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a sleep coach..." },
        { role: "user", content: userMessage }
      ]
    });
    
    return {
      text: response.data.choices[0].message.content,
      type: this.analyzeResponseType(response),
      confidence: response.confidence || 0.8
    };
  }
}
```

### Rate Limiting and Caching
```typescript
class RateLimitedAIService {
  private lastRequest = 0;
  private cache = new Map();
  
  async generateResponse(message: string) {
    // Check rate limit
    if (Date.now() - this.lastRequest < 1000) {
      throw new Error('Rate limited');
    }
    
    // Check cache
    if (this.cache.has(message)) {
      return this.cache.get(message);
    }
    
    // Generate and cache response
    const response = await this.aiService.generate(message);
    this.cache.set(message, response);
    
    return response;
  }
}
```

## Performance Considerations

### Memory Management
- Chat history is limited to last 100 messages
- Images and media are not stored in chat history
- AsyncStorage is used for persistence (consider SQLite for large datasets)

### Animations
- Native driver is used for all animations
- Animation cleanup in useEffect return functions
- Throttled scroll events for better performance

### Network Efficiency
- Request debouncing for typing indicators
- Offline fallback responses
- Error handling with retry mechanisms

## Accessibility

### Screen Reader Support
- Proper ARIA labels on all interactive elements
- Message role announcements
- Time stamp reading

### Keyboard Navigation
- Tab order for suggestions and buttons
- Enter key support for sending messages
- Escape key for dismissing modals

## Testing Strategy

### Unit Tests
```typescript
describe('SleepAIService', () => {
  it('should generate appropriate responses', async () => {
    const response = await sleepAI.generateResponse('How did I sleep?');
    expect(response.type).toBe('insight');
    expect(response.text).toContain('sleep');
  });
});
```

### Integration Tests
```typescript
describe('ChatScreen', () => {
  it('should send message and receive response', async () => {
    const { getByPlaceholderText, getByText } = render(<ChatScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Ask about your sleep...'), 'Test message');
    fireEvent.press(getByTestId('send-button'));
    
    await waitFor(() => {
      expect(getByText('Test message')).toBeTruthy();
    });
  });
});
```

## Future Enhancements

### Planned Features
- [ ] Voice input and speech-to-text
- [ ] Rich message content (charts, images)
- [ ] Message reactions and ratings
- [ ] Export chat conversations
- [ ] Multi-language support
- [ ] Push notifications for sleep reminders

### Advanced AI Features
- [ ] Conversation memory across sessions
- [ ] Personalized learning from user interactions
- [ ] Integration with wearable device data
- [ ] Predictive sleep coaching
- [ ] Mood and energy correlation analysis

## Troubleshooting

### Common Issues

#### Messages not appearing
- Check AsyncStorage permissions
- Verify FlatList ref is properly set
- Ensure message IDs are unique

#### AI responses failing
- Check network connectivity
- Verify API rate limits
- Review error handling in catch blocks

#### Performance issues
- Limit chat history length
- Optimize re-renders with React.memo
- Use FlatList's optimization props

### Debug Mode
Enable debug logging:
```typescript
const DEBUG_CHAT = __DEV__ && true;

if (DEBUG_CHAT) {
  console.log('Chat Debug:', { message, response, context });
}
```

## Contributing

When contributing to the chat system:

1. **Follow TypeScript strict mode** - All components must be properly typed
2. **Maintain accessibility** - All interactive elements need proper labels
3. **Test on real devices** - Chat UX varies significantly between simulators and devices
4. **Consider edge cases** - Network failures, rate limits, empty states
5. **Document new features** - Update this README with any new functionality

The chat system is designed to be the primary way users interact with their sleep data, so maintaining a high standard of UX and reliability is crucial for user engagement and satisfaction.