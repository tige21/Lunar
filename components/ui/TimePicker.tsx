import React, { useState } from 'react';
import {
  StyleSheet,
  Pressable,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  SlideInDown
} from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { ThemedButton } from '../ThemedButton';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol } from './IconSymbol';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type TimePickerProps = {
  value?: Date | string;
  onChange: (time: Date | string) => void;
  label?: string;
  placeholder?: string;
  mode?: '12h' | '24h';
  disabled?: boolean;
  minimumTime?: Date;
  maximumTime?: Date;
};

export function TimePicker({
  value,
  onChange,
  label,
  placeholder = 'Select time',
  mode = '12h',
  disabled = false,
  minimumTime,
  maximumTime,
}: TimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const scaleValue = useSharedValue(1);
  const borderValue = useSharedValue(0);
  
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const formatTime = (time?: Date | string): string => {
    if (!time) return '';
    
    // Ensure we have a Date object
    let dateObj: Date;
    if (time instanceof Date) {
      dateObj = time;
    } else if (typeof time === 'string') {
      // Handle string format like "23:00"
      const [hours, minutes] = time.split(':').map(Number);
      dateObj = new Date();
      dateObj.setHours(hours, minutes, 0, 0);
    } else {
      return '';
    }
    
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: mode === '12h',
    };
    return dateObj.toLocaleTimeString('en-US', options);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedTime) {
      // If the original value was a string, return a string in HH:MM format
      if (typeof value === 'string') {
        const hours = selectedTime.getHours().toString().padStart(2, '0');
        const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
        onChange(`${hours}:${minutes}`);
      } else {
        onChange(selectedTime);
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowPicker(true);
      borderValue.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };
  
  const handlePressIn = () => {
    scaleValue.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };
  
  const handlePressOut = () => {
    scaleValue.value = withSpring(1, { damping: 15, stiffness: 300 });
  };
  
  const animatedInputStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
      borderColor: withTiming(
        borderValue.value === 1 ? tintColor : borderColor,
        { duration: 200 }
      )
    };
  });

  const handleDone = () => {
    setShowPicker(false);
    borderValue.value = withSpring(0, { damping: 15, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const renderPicker = () => {
    if (Platform.OS === 'ios') {
      return (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowPicker(false)}
          >
            <ThemedView style={[styles.pickerContainer, { backgroundColor: surfaceColor }]}>
              <ThemedView style={styles.pickerHeader}>
                <ThemedText type="heading">Select Time</ThemedText>
                <ThemedButton
                  title="Done"
                  variant="primary"
                  size="small"
                  onPress={handleDone}
                />
              </ThemedView>
              
              <DateTimePicker
                value={(() => {
                  if (!value) return new Date();
                  if (value instanceof Date) return value;
                  // Convert string to Date
                  const [hours, minutes] = value.split(':').map(Number);
                  const date = new Date();
                  date.setHours(hours, minutes, 0, 0);
                  return date;
                })()}
                mode="time"
                is24Hour={mode === '24h'}
                display="spinner"
                onChange={handleTimeChange}
                minimumDate={minimumTime}
                maximumDate={maximumTime}
                style={styles.picker}
              />
            </ThemedView>
          </Pressable>
        </Modal>
      );
    }

    if (showPicker) {
      return (
        <DateTimePicker
          value={(() => {
            if (!value) return new Date();
            if (value instanceof Date) return value;
            // Convert string to Date
            const [hours, minutes] = value.split(':').map(Number);
            const date = new Date();
            date.setHours(hours, minutes, 0, 0);
            return date;
          })()}
          mode="time"
          is24Hour={mode === '24h'}
          display="default"
          onChange={handleTimeChange}
          minimumDate={minimumTime}
          maximumDate={maximumTime}
        />
      );
    }

    return null;
  };

  return (
    <ThemedView style={styles.container}>
      {label && (
        <ThemedText type="label" style={styles.label}>
          {label}
        </ThemedText>
      )}
      
      <Pressable
        style={[
          styles.input,
          {
            backgroundColor: surfaceColor,
            borderColor: borderColor,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
      >
        <ThemedText
          style={[
            styles.inputText,
            { color: textColor },
          ]}
        >
          {value ? formatTime(value) : placeholder}
        </ThemedText>
        
        <ThemedText style={[styles.icon, { color: textColor }]}>
          🕐
        </ThemedText>
      </Pressable>

      {renderPicker()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
  },
  inputText: {
    fontSize: 16,
    flex: 1,
  },
  icon: {
    fontSize: 18,
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area for iPhone
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  picker: {
    height: 200,
  },
});