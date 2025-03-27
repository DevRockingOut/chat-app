import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { getAllFriendshipLinks, getUserByEmail, getUserByID, isFriend } from '../utils/userUtil';
import Chats from './ChatList';
import ChatListFilter, { ChatType } from './ChatListFilter';
import AddFriendForm, { Friend } from './Friend';
import GroupChat from './GroupChat';
import PrivateChat from './PrivateChat';
import styled from 'styled-components';
import '../styles/dashboard.css';
import { ReactComponent as AddFriend } from '../assets/person_add_24dp.svg';
import Search from './Search';
import { findPrivateChat } from '../utils/chatUtil';

const Dashboard = styled.div`
    width:98%;
    min-height:96%;
    max-height:96%;
    margin-left:2%;
    margin-right:2%;
    position:relative;
`;

const ChatsContainer = styled.div`
    width:30%;
    height:100%;
    box-shadow: rgba(0, 0, 0, 0.3) 1px 1px 5px 0px;
    margin-left:auto;
    margin-right:auto;
    position:relative;
    overflow:hidden;
    /*transition: transform 0.7s ease-in;*/
    /*transform: translateX(100%);*/
    background-color:#fff;
`;

const ConversationArea = styled.div`
    width:calc(70% - 30px);
    height:100%;
    margin-left:15px;
    box-shadow: rgba(0, 0, 0, 0.3) 1px 1px 5px 0px;
    float:left;
    position:relative;
    visibility:hidden;
    opacity: 0;
    /*transition: opacity 0.3s ease-out 0.7s, visibility 0s linear 0.7s;*/
`;

const Friends = styled.div`
    width:100%;
    position:relative;
    margin-top:5px;
    margin-bottom:20px;
    padding:0px 7px;
`;

const addContactType = Object.freeze({
    FRIENDS: "friends",
    GROUP: "group"
});

export const SubTitle = styled.h3`
    font-weight: 600;
    text-align:center;
    margin-bottom:5px;
    margin-top:25px;
`;

function ChatDashboard({ authUser }) {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);
    const [userChats, setUserChats] = useState([]);
    const [userChatsVisible, setUserChatsVisible] = useState([]);
    const [userChatTypeSelected, setUserChatTypeSelected] = useState(ChatType.ALL);
    const [userChatSelected, setUserChatSelected] = useState({});
    const [addContact, setAddContact] = useState(null);
    const [isAddFriendsOpen, setAddFriendsOpen] = useState(false);
    const [friends, setFriends] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [wasEmptyInitially, setWasEmptyInitially] = useState(false);

    const handleSetUserChats = (type, chats) => {
        if (_.isEmpty(chats)) {
            setWasEmptyInitially(true);
        }
        setUserChats(chats);
        setTimeout(() => handleChatTypeSelected(type, chats), 0);
    };

    const handleChatTypeSelected = (type, chats = []) => {
        if (type === ChatType.GROUP || type === ChatType.PRIVATE) {
            const chatsFound = chats.filter((chat) => chat.type === type);
            setUserChatsVisible(chatsFound);
            setUserChatTypeSelected(type);
        } else {
            setUserChatsVisible(chats);
            setUserChatTypeSelected(ChatType.ALL);
        }
    };

    const handleFriendClick = (friend) => {
        setParticipants([friend]);
        setUserChatTypeSelected(ChatType.PRIVATE);
    };

    const handleAddContact = (e, type) => {
        e.preventDefault();
        setAddContact(type);
        if (type === addContactType.FRIENDS) {
            setAddFriendsOpen(true);
        }
    };

    const fetchUser = async () => {
        if (!authUser) return;

        // TODO: read authUser from browser storage/cache
        const dbUser = await getUserByEmail(authUser.email);
        console.log("DB USER", dbUser);
        setUser(dbUser);

        await fetchAllFriends(dbUser);
        setLoading(false);
    };

    const fetchAllFriends = async (dbUser) => {
        const allFriendsLink = await getAllFriendshipLinks(dbUser);

        let allFriends = [];
        for (let i = 0; i <= allFriendsLink.length - 1; i++) {
            let friendInfo;

            if (allFriendsLink[i].userId1 != dbUser.id) {
                friendInfo = await getUserByID(allFriendsLink[i].userId1);
            } else {
                friendInfo = await getUserByID(allFriendsLink[i].userId2);
            }
            allFriends.push(friendInfo);
        };

        setFriends(allFriends);
    };

    const handleChatSelection = async (selectedChat, user2) => {
        console.log("chat selection click", selectedChat);
        if (_.isEmpty(selectedChat)) {
            setParticipants([user2]);
            setUserChatTypeSelected(ChatType.PRIVATE);
            setUserChatSelected(null);
        } else {
            setParticipants([selectedChat.user2]);
            setUserChatTypeSelected(selectedChat.type);
            setUserChatSelected(selectedChat);
        }
    };

    const handleSearchResultSelected = async (person) => {
        // verify if the current user and the person selected are friends
        console.log("Person Selected Time:", Date.now());
        const { friends, user1, user2 } = await isFriend(user, person);
        console.log("Friend Found Time:", Date.now());

        console.log("user1 found:", user1);
        console.log("user2 found:", user2);

        if (friends) {
            const chat = await findPrivateChat(user1, user2);
            console.log("Private Chat Found Time:", Date.now());
            handleChatSelection(chat, user2);
        } else {
            const user2Infos = await getUserByID(user2.id);
            handleChatSelection(null, user2);
        }
        console.log("Initialized Time:", Date.now());
    };

    useEffect(() => {

        // fetch all chat types db infos
        fetchUser();
    }, []);

    useEffect(() => {
        handleChatTypeSelected(userChatTypeSelected, userChats);
    }, [userChats, userChatTypeSelected]);

    if (loading) {
        return <div>Loading...</div>;
    }

    const animateChatOpen = () => {
        if (!_.isEmpty(userChats) && _.isEmpty(userChatSelected)) {
            const privateChat = _.find(userChats, x => x.type === ChatType.PRIVATE);
            handleChatSelection(privateChat);
        }

        return wasEmptyInitially && !_.isEmpty(userChats);
    };

    const isPrivateChatSelected = () => {
        return userChatSelected?.type === ChatType.PRIVATE ||
            (userChatTypeSelected === ChatType.PRIVATE && participants.length === 1);
    }

    return (
        <Dashboard>
            <ChatsContainer className={animateChatOpen() ? 'ChatsContainer animate-open' : 'ChatsContainer open'}>
                <SubTitle>Chats</SubTitle>
                <Search id={"search"} onResultSelected={handleSearchResultSelected} user={user} />
                <Friends>
                    {friends ?
                        friends.map((friend) => <Friend user={friend} onFriendClick={handleFriendClick} />)
                        : null}
                </Friends>
                <div id="actionsContainer">
                    <ChatListFilter user={user} setChatTypeSelected={handleChatTypeSelected} setUserChats={handleSetUserChats} />
                    <button id="addFriendBtn" onClick={(e) => { handleAddContact(e, addContactType.FRIENDS); }}><AddFriend /></button>
                </div>
                <Chats chats={userChatsVisible} handleChatSelection={handleChatSelection} />
            </ChatsContainer>
            <AddFriendForm isOpen={isAddFriendsOpen} setIsOpen={setAddFriendsOpen} user={user} friends={friends} setFriends={setFriends} />

            <ConversationArea id="feedContainer" className={animateChatOpen() ? 'ConversationArea animate-open' : 'ConversationArea open'}>
                {isPrivateChatSelected() ?
                    <PrivateChat user={user} friend={participants[0]} chat={userChatSelected} setUserChatSelected={handleChatSelection} /> :
                    <GroupChat user={user} friends={participants} chat={userChatSelected} />}
            </ConversationArea>
        </Dashboard>
    );
}

export default ChatDashboard;