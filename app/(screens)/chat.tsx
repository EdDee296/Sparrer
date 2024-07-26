import { View, Text, ActivityIndicator, Button, TouchableOpacity } from 'react-native';
import { Bubble, Composer, ComposerProps, GiftedChat, IMessage, SendProps } from 'react-native-gifted-chat';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getDatabase, onValue, push, ref, set } from 'firebase/database';
import { Image } from 'react-native';

const chat = () => {
  const database = getDatabase();
  const route = useRoute();
  const navigation = useNavigation();
  const { name, uid, url, userUid } = route.params;
  const chatId = userUid > uid ? `${userUid}-${uid}` : `${uid}-${userUid}`;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const getChat = () => {
    onValue(ref(database, '/messages/' + chatId), (snapshot) => {
      let messages = [];
      snapshot.forEach((child) => {
        const message = child.val();
        message.createdAt = new Date(message.createdAt); // Convert timestamp to Date object
        messages.push(message);
      });
      messages.reverse();
      setMessages(messages);
      setLoading(false);
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: name,
      headerStyle: {
        backgroundColor: '#eb4949',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerTitleAlign: 'center', // Center the title
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('(tabs)', { screen: 'explore' })}
          style={{ marginLeft: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, name]);

  useEffect(() => {
    if (!uid) {
      console.error('UID is undefined');
    }
    // Simulate loading messages
    setTimeout(() => {
      getChat(); 
    }); // Simulate a 2-second loading time
  }, [uid]);



// Preload avatar function
const preloadAvatar = (url) => {
  return new Promise((resolve, reject) => {
    Image.prefetch(url)
      .then(() => resolve(true))
      .catch(() => reject(false));
  });
};

const onSend = useCallback(async (messages = []) => {
  try {
    // Preload avatar before sending the message
    await preloadAvatar(url);

    const postListRef = ref(database, `/messages/${chatId}/`);
    const newPostRef = push(postListRef);
    set(newPostRef, {
      ...messages[0],
      createdAt: new Date().getTime(), // Store timestamp
      user: {
        _id: userUid,
        avatar: url,
      }
    });
  } catch (error) {
    console.error('Failed to preload avatar:', error);
  }
}, [chatId, database, url, userUid]);

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

  const ChatComposer = (
    props: ComposerProps & {
      onSend: SendProps<IMessage>["onSend"]
      text: SendProps<IMessage>["text"]
    }
  ) => {
    return (
      <Composer
        {...props}
        textInputProps={{
          ...props.textInputProps,
          blurOnSubmit: false,
          multiline: false,
          onSubmitEditing: () => {
            if (props.text && props.onSend) {
              props.onSend({ text: props.text.trim() }, true);
            }
          },
        }}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#959191]">
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="red" />
        </View>
      ) : (
        <GiftedChat
          messages={messages}
          onSend={(messages) => onSend(messages)}
          user={{
            _id: userUid,
          }}
          renderBubble={renderBubble}
          renderComposer={ChatComposer}
        />
      )}
    </SafeAreaView>
  );
};

export default chat;