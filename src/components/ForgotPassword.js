import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from '../utils/firebaseConfig';
import { ReactComponent as DogIcon } from '../assets/dog2.svg';
import { Link } from "react-router-dom";
import { AuthContainer, Title, Form, Input, Label, Button } from './Auth';
import styled from "styled-components";
import "../styles/auth.css";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const resetPassword = async (e) => {
        e.preventDefault();

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("An email to reset your password was sent to " + email);
        } catch (error) {
            console.log("Error sending the password reset email:", error.message);
            setMessage("There was a problem sending the email, verify the email is correct and try again.");
        }
    };

    return (
        <AuthContainer>
            <Form>
                <Title>Reset Password</Title>
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
                {message ?
                    <div>
                        <p>{message}</p><br />
                    </div> : null}
                <Button onClick={resetPassword}>Send reset email</Button>
                <br />
                <div id="backLogin">
                    <Link to="/" id="Login">Back to login</Link>
                </div>
            </Form>
        </AuthContainer>
    );
}

export default ForgotPassword;