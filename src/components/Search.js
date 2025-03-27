import React, { useEffect, useRef, useState } from 'react';
import SearchBar from './SearchBar';
import { ReactComponent as SearchIcon } from '../assets/search_24dp.svg';
import CustomSelect from './CustomSelect';
import _ from 'lodash';

const Search = ({ id, onResultSelected, user }) => {
    const [searchResults, setSearchResults] = useState([]);
    const [options, setOptions] = useState([]);
    const [optionSelected, setOptionSelected] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const parentControlRef = useRef(null);

    const handleOptionSelected = (option) => {
        console.log("option selected:", option);
        const found = _.find(searchResults, (x) => x.id === option.id);
        console.log("found:", found);
        setOptionSelected(option);
        onResultSelected(found);
    };

    const handleSetSearchResults = (results) => {
        try {
            const formattedResults = results.map((x) => ({ id: x.id, value: x.fullname }));
            setSearchResults(results);
            setOptions(formattedResults);

            if (formattedResults.length > 0) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        } catch (error) {
            console.log(error);
            setSearchResults([]);
            setOptions([]);
            setIsOpen(false);
        }
    };

    const onSearchBarClick = (e) => {
        if (searchResults?.length > 0) {
            setIsOpen(true);
        }
    };

    return (
        <div className="SearchContainer" ref={parentControlRef}>
            <SearchBar id={id} setResults={handleSetSearchResults} isOpen={isOpen} onSearchBarClick={onSearchBarClick} user={user} />
            <SearchIcon className="searchIcon" />
            <CustomSelect
                options={options}
                selected={optionSelected}
                setSelected={handleOptionSelected}
                hideButton={true}
                showProfileIcons={true}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                containerClassName={"form-custom-select"}
                dropDownClassName={"form-select-dropdown"}
                parentControlRef={parentControlRef} />
        </div>
    );
};

export default Search;