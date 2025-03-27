import React, { useState } from 'react';
import { v4 as uuidv4 } from "uuid";
import '../styles/message.css';

export const uniqueMessageId = () => uuidv4();

export const FriendMessage = ({ id, text }) => {
    return (
        <p class="from-them">{text}</p>
    );
};

export const UserMessage = ({ id, text }) => {
    return (
        <p class="from-me">{text}</p>
    );
};