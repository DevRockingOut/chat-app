import React, { useState, useEffect } from 'react';
import { db } from '../utils/firebaseConfig';
import { collection, query, where, orderBy, onSnapshot, limit } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import styled from 'styled-components';
import '../styles/dashboard.css';
import CustomSelect from './CustomSelect';

export const ChatType = Object.freeze({
    ALL: "all",
    GROUP: "group",
    PRIVATE: "private"
});

export const ChatTitle = Object.freeze({
    ALL: "All Chats",
    GROUP: "Group Chats",
    PRIVATE: "Private Chats"
});

export const uniqueChatId = () => uuidv4();

function ChatListFilter({ user, setChatTypeSelected, setUserChats }) {
    const [batchSize, setBatchSize] = useState(10);
    const [optionSelected, setOptionSelected] = useState(ChatTitle.ALL);
    const options = [
        { id: 1, value: ChatTitle.ALL },
        { id: 2, value: ChatTitle.GROUP },
        { id: 3, value: ChatTitle.PRIVATE }
    ];
    const [isOpen, setIsOpen] = useState(false);

    const handleOptionSelected = (option) => {
        // update option selected value
        setOptionSelected(option.value);

        if (option.value === ChatTitle.PRIVATE) {
            setChatTypeSelected(ChatType.PRIVATE);
        } else if (option.value === ChatTitle.GROUP) {
            setChatTypeSelected(ChatType.GROUP);
        } else {
            setChatTypeSelected(ChatType.ALL);
        }
    };

    useEffect(() => {
        console.log("CURRENT USER", user);
        const groupChatsQuery = query(collection(db, "groupChat"), where("createdBy", "==", user.id), limit(batchSize));
        const privateChatsQuery = query(collection(db, "privateChat"), where("userId1", "==", user.id), limit(batchSize));

        // Listen for real-time updates in both collections
        const unsubscribeGroupChats = onSnapshot(groupChatsQuery, (groupSnapshot) => {
            const groupChats = groupSnapshot.docs.map((doc) => {
                const { _id, ...data } = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    type: ChatType.GROUP, // Mark as group chat
                };
            });

            const unsubscribePrivateChats = onSnapshot(privateChatsQuery, (privateSnapshot) => {
                const privateChats = privateSnapshot.docs.map((doc) => {
                    const { _id, ...data } = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        type: ChatType.PRIVATE, // Mark as private chat
                    };
                });

                // Merge and sort chats by lastMessageAt
                const mergedChatRooms = [...groupChats, ...privateChats].sort(
                    (a, b) => b.lastMessageAt - a.lastMessageAt
                );

                setUserChats(ChatType.ALL, mergedChatRooms);
                setChatTypeSelected(ChatType.ALL, mergedChatRooms);
                console.log("USER CHATS", mergedChatRooms);
            },
                (error) => {
                    console.log("Error fetching chat list:", error.message);
                }
            );

            return () => unsubscribePrivateChats();
        },
            (error) => {
                console.log("Error fetching chat list:", error.message);
            }
        );

        return () => unsubscribeGroupChats();
    }, []);

    return (
        <div id="ChatFilter">
            <CustomSelect options={options} selected={optionSelected} setSelected={handleOptionSelected} isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
    );
}

export default ChatListFilter;