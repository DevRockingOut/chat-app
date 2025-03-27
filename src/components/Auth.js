import React, { useEffect, useState } from 'react';
import { db, auth, googleProvider } from '../utils/firebaseConfig';
import { signInWithEmailAndPassword, signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth';
import { collection, addDoc } from "firebase/firestore";
import styled from "styled-components";
import "../styles/auth.css";
import { ReactComponent as DogIcon } from '../assets/dog2.svg';
import { Link, useNavigate } from "react-router-dom";
import { createUserAccount, getUserByEmail } from '../utils/userUtil';
import _ from 'lodash';

const SignInTypes = Object.freeze({
    EMAIL: "email",
    GOOGLE: "google"
});

export const Title = styled.h2`
    font-size: 1.5rem;
    margin-bottom: 10px;
    font-weight: 600;
    text-align:center;
    margin-bottom:22px;
`;

export const AuthContainer = styled.div`
    display: flex;
    width:475px;
    margin:auto;
    background: #fff;
`;

export const Form = styled.form`
    width:100%;
    box-shadow: rgba(0, 0, 0, 0.3) 1px 1px 5px 0px;
    padding:10%;
    padding-top:18%;
    text-align:left;
    position:relative;
`;

export const Input = styled.input`
    width: 100%;
    padding: 5px 16px;
    border-radius: 4px;
    border: 2px solid #e8e9ea;
    background: #f7f7f7;
    -ms-box-sizing: border-box;
    box-sizing: border-box;
    font-size: 15px;
    height: 44px;
    line-height: 40px;
    font-family: inherit;
    -webkit-transition: all 300ms ease-in-out;
    transition: all 300ms ease-in-out;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    -webkit-appearance: none;
    -ms-appearance: none;
    -o-appearance: none;
    -moz-appearance: none;
    appearance: none;
    margin-bottom:15px;
`;

export const Label = styled.label`
    line-height: 30px;
    font-size: 16px;
    font-weight: 500;
    color: #09263c;
`;

export const Button = styled.button`
    font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    width:100%;
    background-color: #008ecf;
    color: #fff;
    -webkit-transition: all 200ms ease-in-out;
    transition: all 200ms ease-in-out;
    box-shadow: none;
    font-weight: 600;
    border: none;
    margin-top: 25px;
    margin-bottom:20px;
    cursor: pointer;
    padding: 0 20px;
    display: block;
    height: 46px;
    border-radius: 4px;
    font-size: 18px;
    line-height: 40px;
    text-transform: capitalize;
    text-align: center;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
`;

function Auth({ user, setUser }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [userAuthenticated, setUserAuthenticated] = useState(false);
    const navigate = useNavigate();

    const signIn = async (type) => {
        try {
            if (type === SignInTypes.EMAIL) {
                const result = await signInWithEmailAndPassword(auth, email, password);
                const user = await getUserByEmail(email);
                setUser(user);
                setUserAuthenticated(true);
                navigate("/chat");
            } else if (type === SignInTypes.GOOGLE) {
                const result = await signInWithPopup(auth, googleProvider);
                const user = await createUserAccount(result.user.email, result.user.email, result.user.displayName, "", "google");
                console.log("USER IS", user);
                setUser(user);
                setUserAuthenticated(true);
                navigate("/chat");
            } else {
                console.log("Received unknown sign in type: ", type);
            }

            setMessage("");
        } catch (error) {
            // Ignore normal error when user closes Google login window
            if (!error.code.includes("auth/popup-closed-by-user")) {
                console.log("Sign-in error:", error);
                setMessage("Oops! That email or password isn't correct. Please try again.");
            } else {
                setMessage("");
            }
        }
    }

    const logOut = async (e) => {
        e.preventDefault();

        try {
            await signOut(auth);
            setUser(null); // Reset user state
            setUserAuthenticated(false);
        } catch (error) {
            console.log("Sign-out error:", error);
        }
    };

    const login = async (e, type) => {
        e.preventDefault();

        signIn(type);
        console.log("User signed in!");
    };

    return (
        <AuthContainer>
            <Form>
                <div id="loginIconContainer">
                    <DogIcon id="dogIcon" />
                </div>
                {message ?
                    <div>
                        <p className='error-message'>{message}</p>
                    </div> : null}
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
                    placeholder="Enter Your Password" />
                <br />
                <div id="RememberMeContainer">
                    <input type="checkbox" name="rememberMe" /><Label id="RememberMe" htmlFor='rememberMe'>Remember Me</Label>
                </div>
                <Link to="/forgot-password" id="ForgotPassword">Forgot Password?</Link>
                <br />
                {userAuthenticated ?
                    <Button onClick={logOut}>Log Out</Button> :
                    <div id="loginContainer">
                        <Button onClick={(e) => { login(e, SignInTypes.EMAIL) }}>Log in</Button>
                        <span id="or">or</span><br />
                        <Button id="btnGoogle" onClick={(e) => { login(e, SignInTypes.GOOGLE) }}><span id="iconGoogle"></span>Log in with Google</Button>
                    </div>
                }
                <br />
                <div id="RegisterContainer">
                    <Label htmlFor='register'>Don't have an account? </Label>
                    <Link to="/register" id="Register">Register</Link>
                </div>
            </Form>
        </AuthContainer>
    );
}

export default Auth;