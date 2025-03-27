import React, { useEffect, useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { ChatType } from './ChatListFilter';
import { ProfileInitials, UserActiveCircle } from './Friend';
import styled from 'styled-components';
import { activeTimeString, getUserByID, getUserLastActive } from '../utils/userUtil';
import { ReactComponent as PackageIcon } from '../assets/downloading_24dp.svg';
import _ from 'lodash';


const Container = styled.div`
    width:100%;
    height:calc(100% - 263px);
    overflow-y:auto;
    overflow-x:hidden;
    padding-right:8px;
    position:relative;
`;

const NoChatsContainer = styled.div`
    width:100%;
    text-align:center;
    position:absolute;
    top:25%;
`;

const Chats = ({ chats, handleChatSelection }) => {
    const [hasChatOpenAnimated, setHasChatOpenAnimated] = useState(false);

    useEffect(() => {
        console.log("CHATS", chats);
        if (!hasChatOpenAnimated && _.isEmpty(chats)) {
            setHasChatOpenAnimated(true);
        }
    }, [chats]);

    const convertToDate = (dateTime) => {
        const weekdayFormat = { weekday: 'short' };
        const dayFormat = { weekday: 'short', day: 'numeric' };
        const dateFormat = { month: 'short', day: 'numeric', year: 'numeric' };
        const timeFormat = { hour: "2-digit", minute: "2-digit", hour12: true };

        const time = new Timestamp(dateTime.seconds, dateTime.nanoseconds);
        const date = time.toDate();
        const now = new Date();
        const sevenDaysAgo = new Date(now.getDate() - 7);

        if (now.getFullYear() - date.getFullYear() > 0) {
            return date.toLocaleDateString("en-US", dateFormat);
        } else if (date < sevenDaysAgo) {
            return date.toLocaleDateString("en-GB", dayFormat);
        } else if (date.toDateString() === date.toDateString()) {
            return date.toLocaleTimeString("en-US", timeFormat).toLowerCase();
        } else {
            return date.toLocaleDateString("en-US", weekdayFormat);
        }
    };

    const showUserActiveStatus = async (chat) => {
        const user = await getUserByID(chat.userId2);
        return getUserLastActive(user);
    };

    // TODO: write alternative group profile initials component, change icon for multiple profile initials combined
    // TODO: write alternative image profile icon for group and private chats
    return (
        <Container>
            {chats.map(chat => (
                <div className="search-list-item" onClick={() => handleChatSelection(chat)}>
                    <div className='item-profile-container'>
                        {chat.type === ChatType.GROUP ?
                            <ProfileInitials className='item-profile-icon' /> :
                            <ProfileInitials className='item-profile-icon' />}
                        {showUserActiveStatus(chat) === activeTimeString.Now ? <UserActiveCircle className='item-profile-active-circle' /> : null}
                    </div>
                    <div>
                        <span className="item-chat-name">{chat.name}</span><br />
                        <span className="item-last-message">{chat.lastMessage} · </span><span className="item-last-message-time">{convertToDate(chat.lastMessageAt)}</span>
                    </div>
                </div>
            ))}
            {_.isEmpty(chats) && !hasChatOpenAnimated ?
                <NoChatsContainer>
                    <PackageIcon className='chat-list-package-icon' />
                    <div>
                        <span id="NoChatSubtitle">No Messages, yet.</span><br />
                        <span id="NoChatMessage">No messages in your inbox, yet!<br /> Be the first to send a message.</span>
                    </div>
                </NoChatsContainer> : null}
        </Container>
    );
}

export default Chats;