import { View, ActivityIndicator, TouchableOpacity, Image, Text, Platform, StyleSheet } from 'react-native';
import { Bubble, Composer, ComposerProps, GiftedChat, IMessage, InputToolbar, SendProps } from 'react-native-gifted-chat';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getDatabase, onValue, push, ref, set } from 'firebase/database';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import uuid from 'react-native-uuid'

const chat = () => {
  const database = getDatabase();
  const route = useRoute();
  const navigation = useNavigation();
  const { name, uid, url, userUid } = route.params;
  const chatId = userUid > uid ? `${userUid}-${uid}` : `${uid}-${userUid}`;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [img, setImage] = useState('');
  const [video, setVideo] = useState('');

  const addImage = async () => {
    let _media = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!_media.canceled) {
      const selectedMedia = _media.assets[0];
      // console.log('Selected Media:', selectedMedia);

      let mediaType = selectedMedia.type;
      if (selectedMedia.mimeType) {
        if (Platform.OS === 'web') {
          // On web, use mimeType to determine the media type
          if (selectedMedia.mimeType.startsWith('image/')) {
            mediaType = 'image';
          } else if (selectedMedia.mimeType.startsWith('video/')) {
            mediaType = 'video';
          }
        } else {
          // On iOS and Android, use the type property
          mediaType = selectedMedia.type;
        }
      } else {
        alert("File is too big");
      } 
      if (mediaType === 'image') {
        setImage(selectedMedia.uri);
        // console.log(img);
        setVideo(''); // Clear video state if an image is selected
      } else if (mediaType === 'video') {
        setVideo(selectedMedia.uri);
        // console.log(video);
        setImage(''); // Clear image state if a video is selected
      }
    }
  };

  const onSendIcon = () => {
    const message = {
      text: '🤛', // Icon text
      createdAt: new Date().getTime(),
      user: {
        _id: userUid,
        avatar: url,
      },
      _id: uuid.v4(),
    };
    const postListRef = ref(database, `/messages/${chatId}/`);
    const newPostRef = push(postListRef);
    set(newPostRef, message);
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
    videoText: {
      color: '#fff', // White text color
      fontSize: 16, // Font size
      fontWeight: 'bold', // Bold text
      marginRight: 10, // Margin to the right
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
      return;
    }
  
    const fetchMessages = async () => {
      try {
        await getChat();
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
  
    fetchMessages();
  }, [uid, chatId]); // Add chatId as a dependency


  const onSend = useCallback(async (messages = []) => {
    const postListRef = ref(database, `/messages/${chatId}/`);
    const newPostRef = push(postListRef);
    const message = {
      ...messages[0],
      createdAt: new Date().getTime(), // Store timestamp
      user: {
        _id: userUid,
        avatar: url,
      },
      _id: uuid.v4(),
    };
  
    if (img) {
      message.image = img; // Add image URI to the message
      setImage(''); // Clear the image after sending
    }
  
    if (video) {
      message.video = video; // Add video URI to the message
      setVideo(''); // Clear the video after sending
    }
  
    set(newPostRef, message);
  }, [chatId, database, url, userUid, img, video]);

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
      if (sendProps.onSend && (sendProps.text.trim().length > 0 || img || video)) {
        const message = {
          text: sendProps.text.trim(),
          user: { _id: userUid, avatar: url },
          createdAt: new Date().getTime(),
        };
  
        if (img) {
          message.image = img;
        }
  
        if (video) {
          message.video = video;
        }
  
        sendProps.onSend([message], true);
  
        // Clear the image and video states after sending
        setImage('');
        setVideo('');
      }
    };
  
    if (sendProps.text.trim().length > 0 || img || video) {
      return (
        <TouchableOpacity
          style={Platform.select({
            ios: { marginBottom: 12 },
            android: { marginBottom: 12 },
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
      <View style={{ flexDirection: 'row',
        alignContent: 'space-between', display: 'flex', width: '100%' }}>
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
              marginLeft: 82,
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
              paddingTop: 8,
              paddingBottom: 13,
              marginHorizontal: 6,
              marginTop: 20,
              marginLeft: 82,
              borderRadius: 32,
              borderTopColor: 'transparent',
            },
            web: {
              flex: 1,
              width: '90%',
              height: 35,
              backgroundColor: 'grey',
              alignContent: 'center',
              justifyContent: 'center',
              paddingBottom: 20,
              marginHorizontal: 6,
              marginLeft: 50,
              borderRadius: 32,
              borderTopColor: 'transparent',
            },
          })}
        />
        <TouchableOpacity
          onPress={addImage}
          style={Platform.select({
            ios: { marginLeft: 5, marginTop: 25 },
            android: { marginLeft: 5, marginTop: 25 },
            web: { marginLeft: 10, marginTop: 5 }
          })}
        >
          <Feather name="image" size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSendIcon}
          style={Platform.select({
            ios: { marginLeft: 8, marginTop: 25 },
            android: { marginLeft: 8, marginTop: 25 },
            web: { marginLeft: 1420, marginTop: 5 }
          })}
        >
          <MaterialCommunityIcons name="boxing-glove" size={30} color="red" />
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

  const renderMessageVideo = (props) => {
    const { currentMessage } = props;
    return (
      <View style={{ padding: 5 }}>
          <Video
            source={{ uri: currentMessage.video }}
            useNativeControls
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="cover"
            shouldPlay={false}
            isLooping={true}
            style={{ width: 200, height: 150, borderRadius: 10 }}
          />
      </View>
    );
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
  
    if (video) {
      return (
        <View style={styles.footer}>
          <Video
          source={{ uri: video }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="cover"
          shouldPlay={true}
          isLooping={false}
          style={{ width: 200, height: 150, borderRadius: 10 }}
        />
          <TouchableOpacity
            onPress={() => {
              onSend([{ text: '', user: { _id: userUid, avatar: url }, createdAt: new Date().getTime(), _id: video }]);
            }}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setVideo('')}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
        </View>
      );
    }
  
    return null;
  }, [img, video, onSend, userUid, url]);

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
          renderMessageVideo={renderMessageVideo}
        />
      )}
    </SafeAreaView>
  );
};

export default chat;