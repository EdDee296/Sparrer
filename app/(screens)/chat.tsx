import { View, Text, ActivityIndicator } from 'react-native';
import { Bubble, GiftedChat } from 'react-native-gifted-chat';
import React, { useCallback, useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const chat = () => {
  const route = useRoute();
  const { name, uid, url } = route.params;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      console.error('UID is undefined');
    }
    // Simulate loading messages
    setTimeout(() => {
      setMessages([
        {
          _id: 1,
          text: 'Hello developer',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: name,
            avatar: url,
          },
        },
      ]);
      setLoading(false);
    }, 2000); // Simulate a 2-second loading time
  }, [uid]);

  const onSend = useCallback((messages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );
  }, []);

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: 'red',
          },
          left: {
            backgroundColor: 'white',
          },
        }}
        textStyle={{
          right: {
            color: 'white',
          },
          left: {
            color: '#000',
          },
        }}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="red" />
        </View>
      ) : (
        <GiftedChat
          messages={messages}
          onSend={(messages) => onSend(messages)}
          user={{
            _id: 1,
          }}
          renderBubble={renderBubble}
        />
      )}
    </SafeAreaView>
  );
};

export default chat;