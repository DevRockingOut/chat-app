import React, { useState } from 'react';
import { ReactComponent as DogIcon } from '../assets/dog2.svg';
import { Link } from "react-router-dom";
import { auth, db } from '../utils/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from "firebase/firestore";
import { AuthContainer, Title, Form, Input, Label, Button } from './Auth';
import { uniqueMessageId } from './Message';
import styled from "styled-components";
import "../styles/auth.css";
import { createUserAccount } from '../utils/userUtil';


function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullname, setFullname] = useState("");
    const [username, setUsername] = useState("");
    const [message, setMessage] = useState("");

    const signUp = async (e) => {
        e.preventDefault();

        try {
            if (validatePassword() && validateEmail() && validateUsername()) {
                const cuser = await createUserWithEmailAndPassword(auth, email, password);
                await createUserAccount(username, email, fullname, password);
                setMessage("");
                console.log(cuser);
            }
        } catch (error) {
            setMessage("Error creating account, try again later.");
            console.log("Sign-up error:", error.message);
        }
    };

    const validateEmail = () => {
        const errorMessage = `Please enter a valid email`;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(email)) {
            setMessage(errorMessage);
            return false;
        }

        return true;
    };

    const validatePassword = () => {
        const errorMessage = `Password must be at least 8 characters long and 
            include at least one uppercase letter, one lowercase letter, 
            one number, and one special character (e.g., @, #, $, !).`;

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!])[A-Za-z\d@#$%^&*!]{8,}$/

        if (!passwordRegex.test(password)) {
            setMessage(errorMessage);
            return false;
        }

        return true;
    };

    const validateUsername = (value) => {
        // verify if username exists in database
        //setUsername(value);
        return true;
    };

    const verifyFullname = (value) => {
        // Allow only letters (no numbers or special characters)
        if (/^[a-zA-Z]*$/.test(value)) {
            setFullname(value);
        }
    };

    return (
        <AuthContainer>
            <Form onSubmit={signUp}>
                <div id="loginIconContainer">
                    <DogIcon id="dogIcon" />
                </div>
                <Label htmlFor="email">Email</Label><br />
                <Input
                    className='form-input'
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Your Email" />
                <br />
                <Label htmlFor="password">Password</Label><br />
                <Input
                    className='form-input'
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Your Password" /><br />
                <Label htmlFor="fullname">Full name</Label><br />
                <Input
                    className='form-input'
                    name="fullname"
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    placeholder="Enter Your Full Name" /><br />
                <Label htmlFor="username">Username</Label><br />
                <Input
                    className='form-input'
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter Your Username" /><br />
                {message ?
                    <div>
                        <p className='error-message'>{message}</p>
                    </div> : null}
                <Button type="submit">Create Account</Button>
                <br />
                <div id="backLogin">
                    <Link to="/" id="Login">Back to login</Link>
                </div>
            </Form>
        </AuthContainer>
    );
}

export default Register;