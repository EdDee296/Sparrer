import { View, ActivityIndicator, TouchableOpacity, Image, Text, Platform, StyleSheet } from 'react-native';
import { Bubble, Composer, ComposerProps, GiftedChat, IMessage, InputToolbar, SendProps } from 'react-native-gifted-chat';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getDatabase, onValue, push, ref, set } from 'firebase/database';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';

const chat = () => {
  const database = getDatabase();
  const route = useRoute();
  const navigation = useNavigation();
  const { name, uid, url, userUid } = route.params;
  const chatId = userUid > uid ? `${userUid}-${uid}` : `${uid}-${userUid}`;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [img, setImage] = useState('');

  const addImage = async () => {
    let _image = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!_image.canceled) {
      setImage(_image.assets[0].uri);
    }
  };

  const styles = StyleSheet.create({
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 10,
      backgroundColor: '#303331',
    },
    image: {
      height: 75,
      width: 75,
      borderRadius: 10,
    },
    closeButton: {
      marginLeft: 10,
      padding: 5,
      backgroundColor: '#ff0000',
      borderRadius: 5,
    },
    closeButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
  });

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

  const onSend = useCallback(async (messages = []) => {
    const postListRef = ref(database, `/messages/${chatId}/`);
    const newPostRef = push(postListRef);
    const message = {
      ...messages[0],
      createdAt: new Date().getTime(), // Store timestamp
      user: {
        _id: userUid,
        avatar: url,
      }
    };

    if (img) {
      message.image = img; // Add image URI to the message
      setImage(''); // Clear the image after sending
    }

    set(newPostRef, message);
  }, [chatId, database, url, userUid, img]);

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
    const handleSend = () => {
      if (props.text && props.onSend) {
        props.onSend({ text: props.text.trim() }, true);
      } else if (img && props.onSend) {
        props.onSend([{ image: img, user: { _id: userUid, avatar: url }, createdAt: new Date().getTime() }], true);
        setImage(''); // Clear the image after sending
      }
    };

    return (
      <Composer
        {...props}
        textInputStyle={{
          color: 'white',
          fontSize: 16,
          marginHorizontal: 6,
          marginTop: 15
        }}
        placeholderTextColor='white'
        textInputProps={{
          ...props.textInputProps,
          blurOnSubmit: false,
          multiline: false,
          onSubmitEditing: handleSend,
        }}
      />
    );
  };

  const renderSend = (sendProps) => {
    const handleSend = () => {
      if (sendProps.onSend && sendProps.text.trim().length > 0) {
        sendProps.onSend([{ text: sendProps.text.trim(), user: { _id: userUid, avatar: url }, createdAt: new Date().getTime() }], true);
      }
    };
  
    if (sendProps.text.trim().length > 0) {
      return (
        <TouchableOpacity
          style={Platform.select({
            ios: { marginBottom: 12 },
            android: { marginBottom: 10 },
            web: { marginBottom: 5 }
          })}
          onPress={handleSend}
        >
          <Ionicons name="send-sharp" size={24} color="red" />
        </TouchableOpacity>
      );
    }
    return null;
  };

  const MessengerBarContainer = (props) => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', display: 'flex', width: '100%' }}>
        <InputToolbar
          {...props}
          containerStyle={Platform.select({
            ios: {
              flex: 1,
              width: '70%',
              height: 35,
              backgroundColor: 'grey',
              alignContent: 'center',
              justifyContent: 'center',
              paddingTop: 8,
              paddingBottom: 13,
              marginHorizontal: 6,
              marginTop: 20,
              marginLeft: 105,
              borderRadius: 32,
              borderTopColor: 'transparent',
            },
            android: {
              flex: 1,
              width: '70%',
              height: 35,
              backgroundColor: 'grey',
              alignContent: 'center',
              justifyContent: 'center',
              paddingTop: 6,
              paddingBottom: 13,
              marginHorizontal: 6,
              marginTop: 20,
              marginLeft: 105,
              borderRadius: 32,
              borderTopColor: 'transparent',
            },
            web: {
              flex: 1,
              width: '70%',
              height: 35,
              backgroundColor: 'grey',
              alignContent: 'center',
              justifyContent: 'center',
              paddingBottom: 20,
              marginHorizontal: 6,
              marginLeft: 105,
              borderRadius: 32,
              borderTopColor: 'transparent',
            },
          })}
        />
        <TouchableOpacity
          style={Platform.select({
            ios: { marginLeft: 10, marginTop: 17 },
            android: { marginLeft: 10, marginTop: 17 },
            web: { marginLeft: 10, marginTop: 1 }
          })}
        >
          <AntDesign name="filetext1" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={addImage}
          style={Platform.select({
            ios: { marginLeft: 10, marginTop: 17 },
            android: { marginLeft: 10, marginTop: 17 },
            web: { marginLeft: 10, marginTop: 5 }
          })}
        >
          <Feather name="image" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={Platform.select({
            ios: { marginLeft: 10, marginTop: 17 },
            android: { marginLeft: 10, marginTop: 17 },
            web: { marginLeft: 5, marginTop: 7 }
          })}
        >
          <Ionicons name="attach-sharp" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderAvatar = (props, avatarUrl) => {
    if (avatarUrl) {
      return (
        <Image
          {...props}
          source={{ uri: avatarUrl }}
          style={{
            width: 40,  // Set the desired width
            height: 40, // Set the desired height
            borderRadius: 100, // Adjust border radius as needed
            marginRight: 0,  // Add any additional styling here
          }}
        />
      );
    }
    return null;
  };

  const renderChatFooter = useCallback(() => {
    if (img) {
      return (
        <View style={styles.footer}>
        <Image source={{ uri: img }} style={styles.image} />
        <TouchableOpacity
          onPress={() => setImage('')}
          style={styles.closeButton}
        >
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
      </View>
      );
    }
    
    return null;
  }, [img]);
  return (
    <SafeAreaView className="flex-1 bg-[#472525]">
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
          renderAvatar={(props) => renderAvatar(props, url)}
          showUserAvatar={false}
          showAvatarForEveryMessage={true}
          renderBubble={renderBubble}
          renderSend={renderSend}
          renderComposer={ChatComposer}
          renderInputToolbar={(props) => MessengerBarContainer(props)}
          renderChatFooter={renderChatFooter}
        />
      )}
    </SafeAreaView>
  );
};

export default chat;