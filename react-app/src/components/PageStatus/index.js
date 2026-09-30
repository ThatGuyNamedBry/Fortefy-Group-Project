import { useEffect, useState } from 'react';
import './PageStatus.css';

// 'loaded' once a detail page's load thunk has put its record in the store,
// 'missing' for a real 404, and 'error' for anything else that went wrong
const statusOf = (result) => {
    if (!result?.errors) return 'loaded';
    return result.status === 404 ? 'missing' : 'error';
};

// Where a detail page's load stands. load must be memoised with useCallback,
// since a new function means a new load. A response for a record the user has
// already navigated away from is ignored rather than overwriting the status of
// the one now on screen.
export const useLoadStatus = (load) => {
    const [result, setResult] = useState({ load: null, status: 'loading' });

    useEffect(() => {
        let current = true;
        load().then(response => {
            if (current) setResult({ load, status: statusOf(response) });
        });
        return () => { current = false; };
    }, [load]);

    // A status from the previous record's load means this one is still
    // loading. Resetting it in the effect instead would leave one render,
    // painted before the effect runs, showing the previous page's "does not
    // exist" when going from a missing playlist to a real one.
    return result.load === load ? result.status : 'loading';
};

// What a detail page shows instead of its record. "Does not exist" is kept
// for a real 404: a slow or failed request used to say the same thing, so
// every first visit to an album flashed it before the album appeared.
const PageStatus = ({ status, thing }) => {
    if (status === 'loading') {
        return (
            <div className="page-loading" role="status" aria-label={`Loading ${thing}`}>
                <span className="page-spinner" />
            </div>
        );
    }
    if (status === 'missing') return <h1>This {thing} does not exist.</h1>;
    return <h1>This {thing} could not be loaded. Please try again.</h1>;
};

export default PageStatus;
