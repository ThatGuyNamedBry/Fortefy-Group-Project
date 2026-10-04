import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { ModalProvider, Modal } from './context/Modal';
import configureStore from './store';
import * as sessionActions from './store/session';
import App from './App';

import './index.css';

const store = configureStore();

if (import.meta.env.DEV) {
    window.store = store;
    window.sessionActions = sessionActions;
}

// Wrap the application with the Modal provider and render the Modal component
// after the App component so that all the Modal content will be layered as
// HTML elements on top of the all the other HTML elements:
function Root() {
    return (
        <ModalProvider>
            <Provider store={store}>
                <BrowserRouter>
                    <App />
                    <Modal />
                </BrowserRouter>
            </Provider>
        </ModalProvider>
    );
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Root />
    </StrictMode>,
);
