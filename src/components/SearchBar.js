import React, { useState, useEffect, useRef } from 'react';
import { getUsersByFullname } from '../utils/userUtil';
import _ from 'lodash';
import styled from 'styled-components';
import userEvent from '@testing-library/user-event';

export const Search = styled.input`
    width: 100%;
    padding: 4px 20px 5px 50px;
    border-radius: 5px;
    border: 2px solid #e8e9ea;
    border-bottom: 2px solid #e8e9ea;
    background: #fff;
    -ms-box-sizing: border-box;
    box-sizing: border-box;
    font-size: 16px;
    height: 40px;
    line-height: 36px;
    font-family: inherit;
    margin-top:15px;
    margin-bottom:20px;
    position:relative;
    outline: none;
`;

const SearchBar = ({ id, setResults, isOpen = false, onSearchBarClick, user }) => {
    const [searchText, setSearchText] = useState('');
    const typingTimeout = useRef(null); // useRef to store timeout ID

    // Debounced query function
    const queryFirestore = async (queryText) => {
        if (queryText.length === 0) {
            setResults([]); // Clear results if query is empty
            return;
        }

        const searchResults = await getUsersByFullname(queryText);

        let results;
        if (!_.isEmpty(user)) {
            results = _.filter(searchResults, (x) => x.id !== user.id);
        } else {
            results = !_.isEmpty(searchResults) ? searchResults : [];
        }

        setResults(results);
    };

    useEffect(() => {
        // Clear the previous timeout
        clearTimeout(typingTimeout.current);

        // Set a new timeout to run the query after 500ms delay
        typingTimeout.current = setTimeout(() => {
            queryFirestore(searchText);
        }, 500); // 500ms debounce delay

        // Cleanup the timeout if the component unmounts or if searchText changes
        return () => clearTimeout(typingTimeout.current);
    }, [searchText]);

    const handleChange = (e) => {
        setSearchText(e.target.value);
    };

    const handleClick = (e) => {
        if (onSearchBarClick) {
            onSearchBarClick(e);
        }
    };

    return (
        <Search
            placeholder="Search"
            className={`searchInput ${isOpen ? "open" : ""}`}
            id={id}
            autoComplete='off'
            value={searchText}
            onChange={handleChange}
            onClick={handleClick}
        />
    );
};

export default SearchBar;