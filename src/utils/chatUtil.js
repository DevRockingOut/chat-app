import { collection, query, where, getDocs, doc, addDoc, deleteDoc, updateDoc, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { uniqueMessageId } from '../components/Message';
import { db } from './firebaseConfig';
import { ChatType } from '../components/ChatListFilter';

const getChatCollectionName = (chat) => {
    if (chat.type === ChatType.GROUP) {
        return "groupChat";
    } else if (chat.type === ChatType.PRIVATE) {
        return "privateChat";
    } else {
        return "";
    }
};

const getMessagesCollectionName = (chat) => {
    if (chat.type === ChatType.GROUP) {
        return `groupChat/${chat.id}/messages`;
    } else if (chat.type === ChatType.PRIVATE) {
        return `privateChat/${chat.id}/messages`;
    } else {
        return "";
    }
}

export const findPrivateChat = async (user1, user2) => {
    const dummyChatObj = { type: ChatType.PRIVATE };
    const collectionName = getChatCollectionName(dummyChatObj);

    const q = query(collection(db, collectionName), where("userId1", "==", user1.id), where("userId2", "==", user2.id));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    // there can only be 1 private chat between 2 users
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
};

export const createChatRoom = async (chatType, message, user1, user2) => {
    try {
        const dummyChatObj = { type: chatType };
        const collectionName = getChatCollectionName(dummyChatObj);
        let doc;
        const createdTime = new Date();

        if (chatType === ChatType.GROUP) {
            doc = {
                "name": "Your Group",
                "type": chatType,
                "createdAt": createdTime,
                "createdBy": user1.id,
                "members": [user1.id, user2.id],
                "lastMessage": message,
                "lastMessageAt": createdTime
            };
        } else if (chatType === ChatType.PRIVATE) {
            doc = {
                "name": user2.fullname,
                "type": chatType,
                "userId1": user1.id,
                "userId2": user2.id,
                "lastMessage": message,
                "lastMessageAt": createdTime
            };
        } else {
            return null;
        }

        const docRef = await addDoc(collection(db, collectionName), doc);
        return { id: docRef.id, ...doc };
    } catch (error) {
        console.log("Error adding new message:", error.message);
    }
};

const updateLastChatMessage = async (chat, message) => {
    try {
        const collectionName = getChatCollectionName(chat);
        const currentDoc = doc(db, collectionName, chat.id);
        await updateDoc(currentDoc, { lastMessage: message.text, lastMessageAt: new Date() });
    } catch (error) {
        console.log("Error updating last chat message:", error.message);
    }
};

export const createMessage = async (chat, message, sender, messageType = "text") => {
    try {
        const collectionName = getMessagesCollectionName(chat);
        const doc = {
            "chatId": chat.id,
            "senderId": sender.id,
            "text": message,
            "mediaUrl": "",
            "sentAt": new Date(),
            "type": messageType
        };

        const docRef = await addDoc(collection(db, collectionName), doc);
        doc.id = docRef.id;

        await updateLastChatMessage(chat, doc);

        return doc;
    } catch (error) {
        console.log("Error adding new message:", error.message);
    }
};

export const updateMessage = async (chat, newMessage, messages, docID, user) => {
    try {
        for (let i = 0; i < messages.length - 1; i++) {
            const currentMessage = messages[i];

            // the user can only edit messages that he created
            if (currentMessage.id === docID && currentMessage.senderId === user.id) {
                const sentAt = new Date();
                const expireEditTime = new Date(currentMessage.sentAt.getTime() + 5 * 60 * 1000);

                // after 5min the user can't edit the message anymore
                if (sentAt <= expireEditTime) {
                    const currentDoc = doc(db, getMessagesCollectionName(chat), docID);
                    await updateDoc(currentDoc, { text: newMessage, sentAt: sentAt });
                    messages[i].text = newMessage;
                    messages[i].sentAt = sentAt;
                }
                i = messages.length - 1;
            }
        }

        // return the updated list of messages
        return messages;
    } catch (error) {
        console.log("Error updating document:", error.message);
    }
};

export const deleteMessage = async (chat, docID, messages, user) => {
    try {
        let deletedMessage;
        for (let i = 0; i < messages.length - 1; i++) {
            const currentMessage = messages[i];

            // the user can only delete messages that he created
            if (currentMessage.id === docID && currentMessage.senderId === user.id) {
                const currentDoc = doc(db, getMessagesCollectionName(chat), docID);
                await deleteDoc(currentDoc);
                deletedMessage = currentMessage;
                i = messages.length - 1;
            }
        }
        // return the message that was deleted
        return deletedMessage;
    } catch (error) {
        console.log("Error editing document:", error.message);
    }
};

export const getRealTimeMessages = async (chat, callback, batchSize = 10) => {
    try {
        const collectionName = getMessagesCollectionName(chat);
        const q = query(collection(db, collectionName), orderBy("sentAt", 'desc'), limit(batchSize));

        // Listen for real-time messages updates
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map((doc) => {
                return { id: doc.id, ...doc.data() };
            });
            console.log(messages);

            callback(messages);
        },
            (error) => {
                console.log("Error fetching chat list of messages:", error.message);
            }
        );

        return () => unsubscribe();
    } catch (error) {
        console.log("Error fetching real time messages:", error.message);
    }
};