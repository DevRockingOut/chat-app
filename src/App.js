import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import { auth } from './utils/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import styled from "styled-components";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from './components/Auth';
import ChatDashboard from './components/ChatDashboard';
import ForgotPassword from './components/ForgotPassword';
import Register from './components/Register';
import useUserActivity from './utils/userActivityUtil';
import { updateUserActiveStatus } from './utils/userUtil';
import _ from 'lodash';

function App() {
    const [user, setUser] = useState(null);

    /*onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            console.log("User signed in!", auth.currentUser);
        } else {
            console.log("User signed out!", auth.currentUser);
        }
    });*/

    const onUserActive = async (isActive) => {
        if (_.isEmpty(user)) return;

        let newStatus = isActive ? "online" : "offline";

        const userUpdate = {
            ...user,
            status: newStatus,
            lastSeen: new Date(),
        };

        console.log("On Active Change called at ", userUpdate.lastSeen);
        console.log(userUpdate);
        setUser(userUpdate);

        await updateUserActiveStatus(user.docID, userUpdate.status, userUpdate.lastSeen);
    };

    useUserActivity(user, onUserActive);

    return (
        <div className="App">
            <Router>
                <Routes>
                    <Route path="/" element={<Auth user={user} setUser={setUser} />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/chat" element={<ChatDashboard authUser={user} />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;
