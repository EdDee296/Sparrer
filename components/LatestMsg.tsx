import { View, Text } from 'react-native'
import React, { useState, useEffect } from 'react'
import { getDatabase, onValue, ref } from 'firebase/database';

const database = getDatabase();

// Define the prop type
type LatestMsgProps = {
    userUid: string;    
    uid: string;
    font: string;
}

const LatestMsg: React.FC<LatestMsgProps> = ({ userUid, uid, font }) => {
    const chatID =  userUid > uid ? `${userUid}-${uid}` : `${uid}-${userUid}`;
    const [latestMsg, setLatestMsg] = useState('');

    useEffect(() => {
        const messageRef = ref(database, '/messages/' + chatID);
        const unsubscribe = onValue(messageRef, async (snapshot) => {
            const data = await snapshot.val();
            if (data) {
                let text = data[Object.keys(data)[Object.keys(data).length - 1]].text;
                let sender = data[Object.keys(data)[Object.keys(data).length - 1]].user._id;
                setLatestMsg(sender === userUid ? 'You: ' + text : text);
            }
            else {
                setLatestMsg('No messages yet');
            }
        });
        // Cleanup the listener on unmount
        return () => unsubscribe();
    }, [chatID]);

    return (
        <Text style={{ fontFamily: font, color: 'grey', fontSize: 12, marginLeft: 12 }}>
            {latestMsg}
        </Text>
    )
}

export default LatestMsg