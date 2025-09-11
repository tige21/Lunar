import React from 'react';
import {
  Modal as RNModal,
  StyleSheet,
  Pressable,
  Dimensions,
  type ModalProps as RNModalProps,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export type ModalProps = Omit<RNModalProps, 'children'> & {
  children: React.ReactNode;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  showCloseButton?: boolean;
  onClose?: () => void;
  backdrop?: 'blur' | 'dim' | 'none';
};

export function Modal({
  children,
  title,
  size = 'medium',
  showCloseButton = true,
  onClose,
  backdrop = 'blur',
  visible,
  ...rest
}: ModalProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');

  const getModalStyle = () => {
    switch (size) {
      case 'small':
        return {
          width: SCREEN_WIDTH * 0.8,
          maxHeight: SCREEN_HEIGHT * 0.4,
        };
      case 'large':
        return {
          width: SCREEN_WIDTH * 0.95,
          maxHeight: SCREEN_HEIGHT * 0.8,
        };
      case 'fullscreen':
        return {
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          borderRadius: 0,
        };
      default: // medium
        return {
          width: SCREEN_WIDTH * 0.9,
          maxHeight: SCREEN_HEIGHT * 0.6,
        };
    }
  };

  const renderBackdrop = () => {
    if (backdrop === 'none') return null;

    if (backdrop === 'blur') {
      return (
        <BlurView
          intensity={20}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />
      );
    }

    return (
      <ThemedView
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
        ]}
      />
    );
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      {...rest}
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
        activeOpacity={1}
      >
        {renderBackdrop()}
        
        <Pressable
          style={[styles.container]}
          onPress={(e) => e.stopPropagation()}
          activeOpacity={1}
        >
          <ThemedView
            variant="modal"
            style={[
              styles.modal,
              getModalStyle(),
              size !== 'fullscreen' && styles.rounded,
            ]}
          >
            {title && (
              <ThemedView style={styles.header}>
                <ThemedText type="heading" style={styles.title}>
                  {title}
                </ThemedText>
                {showCloseButton && onClose && (
                  <Pressable
                    onPress={onClose}
                    style={styles.closeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <ThemedText
                      style={[styles.closeText, { color: textColor }]}
                    >
                      ×
                    </ThemedText>
                  </Pressable>
                )}
              </ThemedView>
            )}
            
            <ThemedView style={styles.content}>
              {children}
            </ThemedView>
          </ThemedView>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  rounded: {
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 16,
  },
  closeText: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
});