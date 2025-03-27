import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { createMessage, updateMessage, deleteMessage, getRealTimeMessages, createChatRoom } from '../utils/chatUtil';
import { FriendMessage, UserMessage } from './Message';
import styled from 'styled-components';
import { ChatType } from './ChatListFilter';
import { ProfileInitials, UserActiveCircle } from './Friend';
import '../styles/privateChat.css';
import { ReactComponent as SendIcon } from '../assets/send_24dp.svg';
import { activeTimeString, getUserLastActive } from '../utils/userUtil';

const Container = styled.div`
    width:100%;
    height:100%;
    position:relative;
`;

const Header = styled.div`
    width:100%;
    height:10%;
    display:flex;
    align-items:center;
    position:relative;
`;

const ProfileContainer = styled.div`
    position:relative;
    width:67px;
    height:67px;
    margin-top:20px;
    margin-left:2%;
`;

const MessagesArea = styled.div`
    width:100%;
    height:80%;
    overflow-y:auto;
    overflow-x:hidden;
    display: flex;
    flex-direction: column-reverse;
    -ms-overflow-style: none;  /* Internet Explorer 10+ */
    scrollbar-width: none;
    position:relative;
`;

const Messages = styled.div`
    width:100%;
    position:relative;
`;

const Footer = styled.div`
    width:100%;
    height:10%;
    display:flex;
    align-items:center;
    justify-content:center;
`;

const Input = styled.input`
    width: 100%;
    padding: 5px 16px;
    border-radius: 5px;
    border: 2px solid #e8e9ea;
    background: #fff;
    -ms-box-sizing: border-box;
    box-sizing: border-box;
    font-size: 16px;
    height: 40px;
    line-height: 36px;
    font-family: inherit;
    outline: none;
`;

function PrivateChat({ user, friend, chat, setUserChatSelected }) {
    const [messages, setMessages] = useState([]); // database messages, type array of objects
    const [message, setMessage] = useState("");
    const [docID, setDocID] = useState(-1);
    const isActiveNow = useRef(null);
    let count = 0;

    const addNewChatRoom = async () => {
        const chatCreated = await createChatRoom(ChatType.PRIVATE, message, user, friend);
        return chatCreated;
    };

    const sendMessage = async () => {
        let chatRoom = chat;

        if (_.isEmpty(friend)) {
            setMessage("");
            return;
        }

        if (_.isEmpty(chatRoom)) {
            chatRoom = await addNewChatRoom();
            setUserChatSelected(chatRoom);
        }
        const newMessage = await createMessage(chatRoom, message, user);
        const updatedMessages = [newMessage, ...messages];
        setMessages(updatedMessages);
        setMessage("");
    };

    const editMessage = async () => {
        if (_.isEmpty(chat)) return;
        const updatedMessages = await updateMessage(chat, message, messages, docID, user);
        setMessages(updatedMessages);
    };

    const removeMessage = async () => {
        if (_.isEmpty(chat)) return;
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
    }, [chat]);//, setMessages]);

    const handleKeyDown = async (e) => {
        if (e.key === "Enter" && e.target.value !== "") {
            await sendMessage();
            e.target.value = "";
        }
    };

    const printUserLastActive = () => {
        const lastActiveString = getUserLastActive(friend);

        if (lastActiveString === activeTimeString.Now) {
            isActiveNow.current = true;
        } else {
            isActiveNow.current = false;
        }

        return lastActiveString;
    };

    return (
        <Container>
            <Header>
                <ProfileContainer>
                    <ProfileInitials className='item-profile-icon private-chat-profile-icon' />
                    {isActiveNow.current ? <UserActiveCircle /> : null}
                </ProfileContainer>
                {friend ?
                    <div id="privateChatProfileInfos">
                        <span id="title">{friend.fullname}</span><br />
                        <span id="lastActive">{printUserLastActive()}</span>
                    </div> : <div></div>
                }
            </Header>
            <MessagesArea>
                <Messages className='imessage'>
                    {messages.map((msg) => {
                        if (msg.senderId === friend.id) {
                            return <FriendMessage id={msg.id} text={msg.text} />;
                        } else {
                            return <UserMessage id={msg.id} text={msg.text} />;
                        }
                    }
                    )}
                </Messages>
            </MessagesArea>
            <Footer>
                <div id="SendContainer">
                    <Input placeholder="Send a message..." onKeyDown={handleKeyDown} onChange={(e) => setMessage(e.target.value)} value={message} />
                    <SendIcon id="sendIcon" onClick={sendMessage} />
                </div>
            </Footer>
        </Container>
    );
}

export default PrivateChat;