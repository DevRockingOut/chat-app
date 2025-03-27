import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { createMessage, updateMessage, deleteMessage, getRealTimeMessages } from '../utils/chatUtil';
import { UserMessage } from './Message';


function GroupChat({ user, friends, chat }) {
    const [messages, setMessages] = useState([]); // database messages, type array of objects
    const [message, setMessage] = useState("");
    const [docID, setDocID] = useState(-1);

    const sendMessage = async () => {
        const newMessage = await createMessage(chat, message, user);
        const updatedMessages = [newMessage, ...messages];
        setMessages(updatedMessages);
    };

    const editMessage = async () => {
        const updatedMessages = await updateMessage(chat, message, messages, docID, user);
        setMessages(updatedMessages);
    };

    const removeMessage = async () => {
        const deletedMessage = await deleteMessage(chat, docID, messages, user);
        const updatedMessages = messages.filter(x => x !== deletedMessage);
        setMessages(updatedMessages);
    };

    useEffect(() => {
        let unsubscribeFunction;
        console.log("UseEffect Time:", Date.now());

        const fetchMessages = async () => {
            if (!_.isEmpty(chat)) {
                const unsubscribe = await getRealTimeMessages(chat, setMessages);
                console.log("Messages Read Time:", Date.now());
                // Clean up when chat changes or component unmounts
                return unsubscribe;
            } else {
                setMessages([]);
                setMessage("");
            }
        };

        fetchMessages().then(unsubscribe => {
            unsubscribeFunction = unsubscribe;
        });

        // Cleanup the real-time listener when chat changes or component unmounts
        return () => {
            if (unsubscribeFunction) {
                unsubscribeFunction();
            }
        };
    }, [chat]);

    return (
        messages.forEach((msg) => {
            <UserMessage id={msg.id} text={msg.text} />
        })
    );
}

export default GroupChat;