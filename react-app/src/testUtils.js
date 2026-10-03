import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router-dom';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { rootReducer } from './store';

/**
 * Renders a component inside a real store and router, the way the app does,
 * minus the dev logger. Returns the store, and a location that follows the
 * router, so a test can check what was dispatched and where it navigated.
 */
export function renderWithStore(ui, { preloadedState, history = ['/'] } = {}) {
    const store = createStore(rootReducer, preloadedState, applyMiddleware(thunk));
    const location = {};
    const result = render(
        <Provider store={store}>
            <MemoryRouter initialEntries={history} initialIndex={history.length - 1}>
                {ui}
                <Route
                    path="*"
                    render={({ location: current }) => {
                        location.pathname = current.pathname;
                        return null;
                    }}
                />
            </MemoryRouter>
        </Provider>,
    );
    return { ...result, store, location };
}

/** A stand-in for fetch that answers with `body` and `status`. */
export function mockFetch(body, status = 200) {
    const fetchMock = jest.fn(() =>
        Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) }),
    );
    global.fetch = fetchMock;
    return fetchMock;
}
