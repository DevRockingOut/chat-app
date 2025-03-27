import React, { useEffect, useState } from 'react';
import '../styles/addFriend.css';
import styled from 'styled-components';
import { activeTimeString, createFriendshipLink, getUserLastActive, getUsers } from '../utils/userUtil';
import { SubTitle } from './ChatDashboard';
import { ReactComponent as SearchIcon } from '../assets/search_24dp.svg';
import { ReactComponent as AddFriend } from '../assets/person_add_24dp.svg';
import { ReactComponent as ArrowDown } from '../assets/arrow_down_24dp.svg';
import Search from './Search';

export const ProfileInitials = styled.div`
    width:50px;
    height:50px;
    border:1px solid gray;
    border-radius:50%;
`;

export const UserActiveCircle = styled.div`
    width:11px;
    height:11px;
    background-color:#32a852;
    border:3px solid #fff;
    border-radius:50%;
    position:absolute;
    right:13px;
    top:62%;
    transform:translateY(-62%);
`;

export const Friend = ({ user, onFriendClick }) => {
    return (
        <div className='friend-container' onClick={() => onFriendClick(user)}>
            <ProfileInitials className='item-profile-icon hcenter' />
            <span className='hcenter'>{user.fullname}</span>
            {getUserLastActive(user) === activeTimeString.Now ? <UserActiveCircle /> : null}
        </div>
    );
};


function AddFriendForm({ isOpen, setIsOpen, user, friends, setFriends }) {
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState([]);

    const addFriend = async (friend) => {
        const doc = await createFriendshipLink(user, friend);
        setFriends([doc, ...friends]);
    };

    const closeForm = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        const fetchUsers = async () => {
            const dbUsers = await getUsers();

            if (dbUsers) {
                setUsers(dbUsers);
            } else {
                setUsers([]);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div id="Container" className={`slide-up ${isOpen ? 'open' : ''}`}>
            <div id="formHeader">
                <ArrowDown id='arrowDownForm' onClick={closeForm} />
                <SubTitle>Add Friends</SubTitle>
            </div>
            <Search id={"FriendSearchInput"} />
            <h4>{search ? "Add Friends" : "Quick Add"}</h4>
            <div id="AddList">
                {users.map((person) => (
                    <div className="search-list-item">
                        <ProfileInitials className='item-profile-icon' />
                        <div className="item-profile-name">
                            <span className="item-full-name">{person.fullname}</span><br />
                            <span className="item-username">{person.username}</span>
                        </div>
                        <button className='item-add-friend' onClick={() => addFriend(person)}><AddFriend /></button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AddFriendForm;