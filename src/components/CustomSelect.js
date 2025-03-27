import { useState, useRef, useEffect } from "react";
import { ReactComponent as FilterIcon } from '../assets/filter_list_24dp.svg';
import { ProfileInitials } from "./Friend";
import _ from 'lodash';

const CustomSelect = ({
    options,
    selected,
    setSelected,
    isOpen = false,
    setIsOpen,
    hideButton = false,
    showProfileIcons = false,
    containerClassName = null,
    dropDownClassName = null,
    parentControlRef = null
}) => {
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const selectButtonRef = useRef(null);
    const dropdownRef = useRef(null);
    const optionsRef = useRef([]);

    // Toggle dropdown
    const toggleDropdown = (expand = null) => {
        const newState = expand !== null ? expand : !isOpen;
        setIsOpen(newState);

        if (newState) {
            setFocusedIndex(options.findIndex((option) => option === selected) || 0);
        } else {
            setFocusedIndex(-1);
            selectButtonRef.current?.focus();
        }
    };

    // Handle option selection
    const handleOptionSelect = (index) => {
        const selectedOption = options[index];
        if (!selectedOption) return;

        setSelected(selectedOption);
        setIsOpen(false);
    };

    // Handle keyboard navigation
    const handleKeyDown = (event) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setIsOpen(true);
            setFocusedIndex((prev) => (prev + 1) % options.length);
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setFocusedIndex((prev) => (prev - 1 + options.length) % options.length);
        } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleOptionSelect(focusedIndex);
        } else if (event.key === "Escape") {
            setIsOpen(false);
        }
    };

    // Ensure refs update after rendering
    useEffect(() => {
        if (focusedIndex !== -1 && optionsRef.current[focusedIndex]) {
            optionsRef.current[focusedIndex].focus();
        }
    }, [focusedIndex]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const currentRef = parentControlRef?.current || dropdownRef.current;

            if (currentRef && !currentRef.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [parentControlRef]);

    return (
        <div className={containerClassName ? containerClassName : "custom-select"} ref={dropdownRef}>
            {hideButton ? null :
                (<FilterIcon
                    ref={selectButtonRef}
                    className="select-button"
                    role="combobox"
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    onClick={() => toggleDropdown()}
                    onKeyDown={handleKeyDown} />)}

            <ul className={`${dropDownClassName ? dropDownClassName : "select-dropdown "} ${isOpen ? "open" : ""}`} role="listbox">
                {options && options.map((item, index) => (
                    <li
                        key={item.id}
                        ref={(el) => (optionsRef.current[index] = el)}
                        role="option"
                        tabIndex={index === focusedIndex ? "0" : "-1"}
                        className={index === focusedIndex ? "focused" : ""}
                        onClick={() => handleOptionSelect(index)}>
                        {showProfileIcons ? <ProfileInitials className='item-profile-icon-sm' /> : null}
                        {item.value}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CustomSelect;