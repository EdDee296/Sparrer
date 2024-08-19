import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Composer, InputToolbar, SendProps, IMessage, ComposerProps } from 'react-native-gifted-chat';
import { Ionicons } from '@expo/vector-icons';

const CustomInputToolbar = (props) => {
  const { onSend, text } = props;

  const handleSend = () => {
    if (onSend && text.trim().length > 0) {
      onSend([{ text: text.trim(), user: { _id: props.user._id, avatar: props.user.avatar }, createdAt: new Date().getTime() }], true);
    }
  };

  return (
    <View style={styles.container}>
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        renderComposer={(composerProps) => (
          <Composer
            {...composerProps}
            textInputStyle={styles.composer}
            placeholderTextColor='white'
            textInputProps={{
              ...composerProps.textInputProps,
              blurOnSubmit: false,
              multiline: false,
              onSubmitEditing: () => {
                if (composerProps.text && composerProps.onSend) {
                  composerProps.onSend({ text: composerProps.text.trim() }, true);
                }
              },
            }}
          />
        )}
      />
      <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
        <Ionicons name="send-sharp" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'grey',
    borderRadius: 32,
    marginHorizontal: 6,
    marginTop: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  inputToolbar: {
    flex: 1,
    backgroundColor: 'transparent',
    borderTopColor: 'transparent',
  },
  composer: {
    color: 'white',
    fontSize: 16,
    marginHorizontal: 6,
    marginTop: 8,
  },
  sendButton: {
    flex:1,
    paddingBottom: 6,
    marginLeft: 10,
  },
});

export default CustomInputToolbar;