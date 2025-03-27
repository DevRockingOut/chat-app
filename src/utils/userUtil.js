import { collection, query, addDoc, where, doc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { uniqueMessageId } from '../components/Message';
import _ from 'lodash';

export const createUserAccount = async (username, email, fullname, password = "", provider = "") => {
    try {
        const usersCollection = collection(db, "users");
        const q = query(usersCollection, where("email", "==", email));

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            const createdTime = new Date();
            const doc = {
                "_id": uniqueMessageId(),
                "username": username,
                "email": email,
                "password": password,
                "fullname": fullname,
                "fullname_lower": fullname.toLowerCase(),
                "provider": provider,
                "createdAt": createdTime,
                "profilePic": "profile.jpg",
                "lastSeen": createdTime,
                "status": "online",
                "authenticated": true
            };
            const docRef = await addDoc(usersCollection, doc);
            const { _id, ...data } = doc;

            return { docID: docRef.id, id: _id, ...data };
        } else {
            console.log("User already exists!");

            const docRef = querySnapshot.docs[0];
            const { uid, ...data } = docRef.data();
            return { docID: docRef.id, id: uid, ...data };
        }
    } catch (error) {
        console.log(error.message);
    }
};

export const createFriendshipLink = async (user1, user2) => {
    try {
        // TODO: add unique key/pair create constraint
        const doc = {
            "_id": uniqueMessageId(),
            "userId1": user1.id,
            "userId2": user2.id,
            "createdAt": new Date()
        };
        await addDoc(collection(db, "friends"), doc);
        return doc;
    } catch (error) {
        console.log(error.message);
    }
};

export const getAllFriendshipLinks = async (user) => {
    const q1 = query(collection(db, "friends"), where("userId1", "==", user.id));
    const q2 = query(collection(db, "friends"), where("userId2", "==", user.id));

    // Combine results from both queries
    const links = [];

    const snapshot1 = await getDocs(q1);
    const snapshot2 = await getDocs(q2);

    snapshot1.forEach((doc) => {
        const data = doc.data();
        if (!links.includes(data)) {
            links.push(data);
        }
    });
    snapshot2.forEach((doc) => {
        const data = doc.data();
        if (!links.includes(data)) {
            links.push(data);
        }
    });

    return links;
};

export const isFriend = async (user, friend) => {
    const q1 = query(collection(db, "friends"), where("userId1", "==", user.id), where("userId2", "==", friend.id));
    const q2 = query(collection(db, "friends"), where("userId1", "==", friend.id), where("userId2", "==", user.id));

    const snapshot1 = await getDocs(q1);
    const snapshot2 = await getDocs(q2);

    if (snapshot1.empty && snapshot2.empty) {
        // friendship link not found, so users are not friends
        return { friends: false, user1: user, user2: friend };
    }

    // friendship link found, so users are friends
    if (!snapshot1.empty) {
        return { friends: true, user1: user, user2: friend };
    } else {
        return { friends: true, user1: friend, user2: user };
    }

};

export const deleteFriendshipLink = async (docID) => {
    try {
        const currentDoc = doc(db, "friends", docID);
        await deleteDoc(currentDoc);
        return true;
    } catch (error) {
        console.log(error.message);
    }
    return false;
};

export const getUserByEmail = async (email) => {
    try {
        const q = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0]; // Get the first matching document
            const { uid, ...data } = userDoc.data();
            return { docID: userDoc.id, id: uid, ...data };
        } else {
            return null; // No user found
        }
    } catch (error) {
        console.error("Error getting user:", error);
        return null;
    }
};

export const getUserByID = async (userID) => {
    try {
        const q = query(collection(db, "users"), where("uid", "==", userID));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0]; // Get the first matching document
            const { uid, ...data } = userDoc.data();
            return { id: uid, ...data };
        } else {
            return null; // No user found
        }
    } catch (error) {
        console.error("Error getting user:", error);
        return null;
    }
};

export const getUsersByFullname = async (fullname) => {
    try {
        const fullname_lower = fullname.toLowerCase();
        const q = query(collection(db, "users"),
            where("fullname_lower", ">=", fullname_lower),
            where("fullname_lower", "<", fullname_lower + "\uf8ff")
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docs = querySnapshot.docs;
            return docs.map((doc) => {
                const { uid, ...data } = doc.data();
                return { id: uid, ...data };
            });
        } else {
            return null; // No user found
        }
    } catch (error) {
        console.error("Error getting user:", error);
        return null;
    }
};

export const getUsers = async () => {
    try {
        const q = query(collection(db, "users"));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docs = querySnapshot.docs;
            return docs.map((doc) => {
                const { uid, ...data } = doc.data();
                return { id: uid, ...data };
            });
        } else {
            return null; // No user found
        }
    } catch (error) {
        console.error("Error getting user:", error);
        return null;
    }
};

export const updateUserActiveStatus = async (docID, status, lastSeenDateTime) => {
    try {
        const docRef = doc(db, 'users', docID);

        // Update the timestamp field with the value from the server
        return await updateDoc(docRef, {
            status: status,
            lastSeen: lastSeenDateTime
        });

    } catch (error) {
        console.error("Error updating user last seen date:", error);
        return null;
    }
};

export const activeTimeString = {
    NA: "",
    Now: "Active now",
    MinutesAgo: "Active {0}m ago",
    HoursAgo: "Active {0}h ago",
    DaysAgo: "Active {0}d ago",
    WeeksAgo: "Active {0}wk ago",
    MonthsAgo: "Active {0}mo ago",
    YearsAgo: "Active {0}y ago"
};

export const getUserLastActive = (user) => {
    let resultString = activeTimeString.NA;

    if (!_.isEmpty(user?.lastSeen)) {
        // time difference in seconds
        const timeDiff = (Date.now() / 1000) - user.lastSeen.seconds;

        switch (true) {
            case timeDiff < 60:
                resultString = activeTimeString.Now;
                break;
            case timeDiff < (60 * 60):
                const minutes = Math.floor(timeDiff / 60);
                resultString = activeTimeString.MinutesAgo.replace("{0}", minutes);
                break;
            case timeDiff < (60 * 60 * 24):
                const hours = Math.floor(timeDiff / (60 * 60));
                resultString = activeTimeString.HoursAgo.replace("{0}", hours);
                break;
            case timeDiff < (60 * 60 * 24 * 7):
                const days = Math.floor(timeDiff / (60 * 60 * 24));
                resultString = activeTimeString.DaysAgo.replace("{0}", days);
                break;
            case timeDiff < (60 * 60 * 24 * 7 * 4):
                const weeks = Math.floor(timeDiff / (60 * 60 * 24 * 7));
                resultString = activeTimeString.WeeksAgo.replace("{0}", weeks);
                break;
            case timeDiff < (60 * 60 * 24 * 7 * 4 * 12):
                const months = Math.floor(timeDiff / (60 * 60 * 24 * 7 * 4));
                resultString = activeTimeString.MonthsAgo.replace("{0}", months);
                break;
            case timeDiff >= (60 * 60 * 24 * 7 * 4 * 12):
                const years = Math.floor(timeDiff / (60 * 60 * 24 * 7 * 4 * 12));
                resultString = activeTimeString.YearsAgo.replace("{0}", years);
                break;
        }
    }

    return resultString;
};