import React from 'react';
import { Search } from 'lucide-react';
import './css/SearchBar.css';

const SearchBar = ({ onSearch }) => {
    const handleChange = (e) => {
        onSearch(e.target.value);
    };

    return (
        <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input
                type="text"
                placeholder="Search posts..."
                onChange={handleChange}
            />
        </div>
    );
};

export default SearchBar;
