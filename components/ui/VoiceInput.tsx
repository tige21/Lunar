import React, { useState, useEffect, useRef, memo } from 'react';
import { StyleSheet, TouchableOpacity, View, Alert, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
// Note: Expo Speech and Audio would be added in real implementation
// import { Audio } from 'expo-av';
// import * as Speech from 'expo-speech';

export interface VoiceInputProps {
  onTextReceived: (text: string) => void;
  onStartListening?: () => void;
  onStopListening?: () => void;
  isEnabled?: boolean;
  placeholder?: string;
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'error';

export const VoiceInput = memo(function VoiceInput({
  onTextReceived,
  onStartListening,
  onStopListening,
  isEnabled = true,
  placeholder = "Tap to speak about your sleep..."
}: VoiceInputProps) {
  const colorScheme = useColorScheme();
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  
  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    checkPermissions();
  }, []);

  // Start pulse animation when listening
  useEffect(() => {
    if (voiceState === 'listening') {
      startPulseAnimation();
      startWaveAnimation();
    } else {
      stopAnimations();
    }
  }, [voiceState]);

  const checkPermissions = async () => {
    try {
      // In real implementation, check microphone permissions
      // const { status } = await Audio.requestPermissionsAsync();
      // setIsPermissionGranted(status === 'granted');
      
      // Mock permission check for demo
      setIsPermissionGranted(true);
    } catch (error) {
      console.error('Permission check failed:', error);
      setIsPermissionGranted(false);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startWaveAnimation = () => {
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopAnimations = () => {
    pulseAnim.stopAnimation();
    waveAnim.stopAnimation();
    scaleAnim.setValue(1);
    pulseAnim.setValue(1);
    waveAnim.setValue(0);
  };

  const handleVoicePress = async () => {
    if (!isEnabled || !isPermissionGranted) {
      Alert.alert(
        'Microphone Access',
        'Please allow microphone access in Settings to use voice input.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (voiceState === 'idle') {
      startListening();
    } else if (voiceState === 'listening') {
      stopListening();
    }
  };

  const startListening = async () => {
    try {
      setVoiceState('listening');
      setTranscript('');
      onStartListening?.();

      // Animate button press
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Mock speech recognition - in real app, use Expo Speech or native modules
      mockSpeechRecognition();

    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setVoiceState('error');
      
      Alert.alert(
        'Voice Input Error',
        'Could not start voice input. Please try again.',
        [{ text: 'OK', onPress: () => setVoiceState('idle') }]
      );
    }
  };

  const stopListening = async () => {
    try {
      setVoiceState('processing');
      onStopListening?.();

      // In real implementation, stop speech recognition
      // await stopSpeechRecognition();

      // Mock processing delay
      setTimeout(() => {
        if (transcript.trim()) {
          onTextReceived(transcript);
          setVoiceState('idle');
          setTranscript('');
        } else {
          setVoiceState('error');
          setTimeout(() => setVoiceState('idle'), 2000);
        }
      }, 1500);

    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
      setVoiceState('error');
      setTimeout(() => setVoiceState('idle'), 2000);
    }
  };

  // Mock speech recognition for demo purposes
  const mockSpeechRecognition = () => {
    const mockPhrases = [
      "How did I sleep last night?",
      "What can I do to improve my sleep quality?",
      "I'm having trouble falling asleep",
      "Analyze my sleep trends this week",
      "What's my optimal bedtime?",
      "I feel tired even after 8 hours of sleep"
    ];

    // Simulate gradual transcript building
    let currentPhrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
    let currentIndex = 0;

    const buildTranscript = () => {
      if (voiceState === 'listening' && currentIndex < currentPhrase.length) {
        const chunk = currentPhrase.slice(0, currentIndex + Math.floor(Math.random() * 5) + 1);
        setTranscript(chunk);
        currentIndex = chunk.length;
        
        setTimeout(buildTranscript, 150 + Math.random() * 300);
      } else if (voiceState === 'listening') {
        setTranscript(currentPhrase);
      }
    };

    setTimeout(buildTranscript, 300);
  };

  const getVoiceButtonColor = () => {
    switch (voiceState) {
      case 'listening':
        return ['#EF4444', '#DC2626'];
      case 'processing':
        return ['#F59E0B', '#D97706'];
      case 'error':
        return ['#EF4444', '#B91C1C'];
      default:
        return [tintColor as string, tintColor as string];
    }
  };

  const getVoiceButtonIcon = () => {
    switch (voiceState) {
      case 'listening':
        return 'stop.circle.fill';
      case 'processing':
        return 'waveform.circle.fill';
      case 'error':
        return 'exclamationmark.triangle.fill';
      default:
        return 'mic.circle.fill';
    }
  };

  const getStatusText = () => {
    switch (voiceState) {
      case 'listening':
        return 'Listening... Tap to stop';
      case 'processing':
        return 'Processing your request...';
      case 'error':
        return 'Error occurred, try again';
      default:
        return placeholder;
    }
  };

  const renderWaveforms = () => {
    if (voiceState !== 'listening') return null;

    return (
      <View style={styles.waveformContainer}>
        {[0, 1, 2, 3, 4].map((index) => (
          <Animated.View
            key={index}
            style={[
              styles.waveformBar,
              {
                transform: [{
                  scaleY: waveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1.5 + Math.random() * 0.5],
                  }),
                }],
                backgroundColor: voiceState === 'listening' ? '#EF4444' : tintColor as string,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        onPress={handleVoicePress}
        activeOpacity={0.8}
        disabled={!isEnabled}
        style={[
          styles.voiceButton,
          !isEnabled && styles.disabledButton,
        ]}
      >
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              transform: [
                { scale: scaleAnim },
                { scale: voiceState === 'listening' ? pulseAnim : 1 },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={getVoiceButtonColor()}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <IconSymbol
              name={getVoiceButtonIcon()}
              size={32}
              color="white"
            />
            
            {/* Outer glow ring for listening state */}
            {voiceState === 'listening' && (
              <Animated.View
                style={[
                  styles.glowRing,
                  {
                    opacity: waveAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 0.8],
                    }),
                    transform: [{
                      scale: waveAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.4],
                      }),
                    }],
                  },
                ]}
              />
            )}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>

      {renderWaveforms()}

      <View style={styles.statusContainer}>
        <ThemedText 
          style={[
            styles.statusText,
            { 
              color: voiceState === 'error' 
                ? Colors.semantic.error 
                : voiceState === 'listening'
                ? '#EF4444'
                : textColor
            }
          ]}
        >
          {getStatusText()}
        </ThemedText>
        
        {transcript && voiceState === 'listening' && (
          <LinearGradient
            colors={colorScheme === 'dark'
              ? ['rgba(239, 68, 68, 0.2)', 'rgba(220, 38, 38, 0.1)']
              : ['rgba(239, 68, 68, 0.1)', 'rgba(220, 38, 38, 0.05)']
            }
            style={styles.transcriptContainer}
          >
            <ThemedText style={styles.transcriptText}>
              "{transcript}"
            </ThemedText>
          </LinearGradient>
        )}
      </View>

      {!isPermissionGranted && (
        <TouchableOpacity
          onPress={checkPermissions}
          style={styles.permissionButton}
        >
          <LinearGradient
            colors={['#F59E0B20', '#D9770610']}
            style={styles.permissionButtonGradient}
          >
            <IconSymbol name="exclamationmark.triangle" size={16} color="#F59E0B" />
            <ThemedText style={[styles.permissionText, { color: '#F59E0B' }]}>
              Enable microphone access
            </ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },
  voiceButton: {
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonContainer: {
    position: 'relative',
  },
  buttonGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  glowRing: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#EF4444',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    marginBottom: 16,
  },
  waveformBar: {
    width: 3,
    height: 20,
    marginHorizontal: 2,
    borderRadius: 1.5,
  },
  statusContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'Inter',
    marginBottom: 12,
  },
  transcriptContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    maxWidth: '90%',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(239, 68, 68, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  transcriptText: {
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
    color: '#EF4444',
    fontFamily: 'Inter',
  },
  permissionButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  permissionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  permissionText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Inter',
  },
});