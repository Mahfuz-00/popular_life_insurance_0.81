import React, { ReactNode } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { height: deviceHeight } = Dimensions.get('window');

interface BottomModalProps {
  title?: string;
  children: ReactNode;
  visible: boolean;
  onClose: () => void;
  onTouchOutside?: () => void;
}

const BottomModal: React.FC<BottomModalProps> = ({
  title,
  children,
  visible,
  onClose,
  onTouchOutside,
}) => {
  const handleClose = () => {
    onTouchOutside?.();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Dark overlay */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        {/* Modal Content */}
        <View style={styles.content}>
          {title && (
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
            </View>
          )}
          <View style={styles.body}>
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
    width: '100%',
  },
  content: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: deviceHeight * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  titleContainer: {
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#182E44',
    letterSpacing: 0.3,
  },
  body: {
    paddingHorizontal: 5,
  },
});

export default BottomModal;