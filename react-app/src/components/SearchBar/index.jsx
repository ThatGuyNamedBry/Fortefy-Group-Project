import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import './SearchBar.css';

export const SEARCH_PATH = '/search';
const DEBOUNCE_MS = 300;

// Builds the results URL for a term, or the bare search page when it is blank
export const searchUrl = (term) => {
    const trimmed = term.trim();
    return trimmed ? `${SEARCH_PATH}?q=${encodeURIComponent(trimmed)}` : SEARCH_PATH;
};

function SearchBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const inputRef = useRef();
    const timeoutRef = useRef();

    // The URL is the source of truth for the query, so the box follows it when
    // the user navigates (back/forward, or leaving the search page).
    const urlQuery =
        location.pathname === SEARCH_PATH
            ? new URLSearchParams(location.search).get('q') || ''
            : '';
    const [value, setValue] = useState(urlQuery);

    useEffect(() => {
        // Keep whatever the user is mid-typing (including trailing spaces) when
        // it already matches the URL; otherwise adopt the URL's query.
        setValue((current) => (current.trim() === urlQuery ? current : urlQuery));
    }, [urlQuery]);

    // Any navigation (link click, back button) cancels a search still waiting
    // to fire, so it can't yank the user back to the results page.
    useEffect(() => {
        clearTimeout(timeoutRef.current);
    }, [location]);

    useEffect(() => () => clearTimeout(timeoutRef.current), []);

    // Any navigation cancels a pending search (above), so when one runs, this
    // render's location is still the current one
    const goToSearch = (term) => {
        const onSearchPage = location.pathname === SEARCH_PATH;
        if (!term.trim() && !onSearchPage) return;

        // Replace while already on the results page so each keystroke doesn't
        // become its own history entry.
        if (onSearchPage) {
            navigate(searchUrl(term), { replace: true });
        } else {
            navigate(searchUrl(term));
        }
    };

    const handleChange = (e) => {
        const next = e.target.value;
        setValue(next);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => goToSearch(next), DEBOUNCE_MS);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        clearTimeout(timeoutRef.current);
        goToSearch(value);
    };

    const handleClear = () => {
        clearTimeout(timeoutRef.current);
        setValue('');
        if (location.pathname === SEARCH_PATH) {
            navigate(SEARCH_PATH, { replace: true });
        }
        inputRef.current.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') handleClear();
    };

    return (
        <form className="search-bar" role="search" onSubmit={handleSubmit}>
            <i className="fa-solid fa-magnifying-glass search-bar-icon" aria-hidden="true"></i>
            <input
                ref={inputRef}
                type="text"
                className="search-bar-input"
                placeholder="Search songs and albums"
                aria-label="Search songs and albums"
                autoComplete="off"
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
            />
            {value && (
                <button
                    type="button"
                    className="search-bar-clear"
                    onClick={handleClear}
                    aria-label="Clear search"
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>
            )}
        </form>
    );
}

export default SearchBar;
