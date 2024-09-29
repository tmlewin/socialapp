import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import './App.css';
import Feed from './components/Feed';
import Header from './components/Header';
import AuthForm from './components/AuthForm';
import ForumPage from './components/ForumPage';
import ThreadView from './components/ThreadView';
import { updateContext } from './context/updateContext';
import ErrorBoundary from './ErrorBoundary';
import ThreadsPage from './components/ThreadsPage';

function App() {
    const [updater, setUpdater] = useState(0);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    const handleAuth = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    return (
        <Router>
            <div className="App">
                <ErrorBoundary>
                    <updateContext.Provider value={[updater, setUpdater]}>
                        {user ? (
                            <>
                                <Header onLogout={handleLogout} />
                                <Switch>
                                    <Route exact path="/" component={Feed} />
                                    <Route path="/forum" component={ForumPage} />
                                    <Route path="/thread/:threadId" component={ThreadView} />
                                    <Route path="/threads" component={ThreadsPage} />
                                    <Redirect to="/" />
                                </Switch>
                            </>
                        ) : (
                            <AuthForm onAuth={handleAuth} />
                        )}
                    </updateContext.Provider>
                </ErrorBoundary>
            </div>
        </Router>
    );
}

export default App;
