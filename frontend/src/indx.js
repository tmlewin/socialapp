import './App.css';
import Header from './components/Header';
import CreatePost from './components/CreatePost';
import Posts from './components/Posts';
import Sidebar from './components/Sidebar';
import { updateContext } from './context/updateContext';
import { useEffect, useState } from 'react';
import axios from './axios';

const indx = () => {
    const [updater, setUpdater] = useState(0);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmedPassword, setConfirmedPassword] = useState('');
    const [login, setLogin] = useState(false);
    const [warning, showWarning] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const auth = async () => {
        let cred = {
            username,
            password
        };
        if (!login) {
            if (password === confirmedPassword) {
                try {
                    let res = await axios.post("api/auth/register", cred);
                    if (res.data.username === username) {
                        localStorage.setItem('user', JSON.stringify(res.data));
                        setUser(res.data);
                    }
                } catch (error) {
                    console.error("Registration error:", error);
                    showWarning("Registration failed. Please try again.");
                }
            } else {
                showWarning("Passwords don't match");
                return;
            }
        } else {
            try {
                let res = await axios.post("api/auth/login", cred);
                if (res.data.username === username) {
                    localStorage.setItem('user', JSON.stringify(res.data));
                    setUser(res.data);
                } else {
                    showWarning("Credentials don't match");
                }
            } catch (error) {
                console.error("Login error:", error);
                showWarning("Login failed. Please try again.");
            }
        }
    };

    const validPassword = (e) => {
        if (password !== e) {
            showWarning("Passwords don't match");
            return;
        }
        showWarning('');
        setConfirmedPassword(e);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <updateContext.Provider value={[updater, setUpdater]}>
            {user ? (
                <div className="App">
                    <Header onLogout={handleLogout} />
                    <div className="container">
                        <div className="feed">
                            <CreatePost />
                            <Posts />
                        </div>
                        <Sidebar />
                    </div>
                </div>
            ) : (
                login ? (
                    <div className="auth">
                        <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
                        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                        <button onClick={auth}>Sign In</button>
                        <p style={{ color: '#444', cursor: 'pointer' }} onClick={() => setLogin(false)}>Need an account?</p>
                    </div>
                ) : (
                    <div className="auth">
                        <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
                        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                        <input type="password" placeholder="Confirm Password" onChange={(e) => validPassword(e.target.value)} />
                        {warning !== '' && <p style={{ color: 'red' }}>{warning}</p>}
                        <button onClick={auth}>Sign Up</button>
                        <p style={{ color: '#444', cursor: 'pointer' }} onClick={() => setLogin(true)}>Got an account?</p>
                    </div>
                )
            )}
        </updateContext.Provider>
    );
};

export default indx;