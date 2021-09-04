import './App.css';
import Header from './components/Header';
import CreatePost from './components/CreatePost';
import Posts from './components/Posts';
import Sidebar from './components/Sidebar';
import { updateContext } from './context/updateContext';
import { useEffect, useState } from 'react';
import axios from './axios';

function App() {

  const [updater, setUpdater] = useState(0)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmedPassword, setConfirmedPassword] = useState('')

  const [login, setLogin] = useState(false)
  const [warning, showWarning] = useState('')

  const [user, setUser] = useState(null)

  useEffect(()=>{
    if(localStorage.getItem('user')){
      setUser(localStorage.getItem('user'))
    }
  }, [user])


  const auth = async() =>{
    let cred = {
      username,
      password
    }
    if(!login){
      if(password == confirmedPassword){
        let res = await axios.post("api/auth/register", cred);
        if(res.data.username == username){
          localStorage.setItem('user', res.data)
          setUser(res.data)
        }
      }
      else{
        showWarning("passwords don't match")
        return
      }
    }
    else{
      let res = await axios.post("api/auth/login", cred);
      if(res.data.username == username){
        localStorage.setItem('user', res.data)
        setUser(res.data)
      }
      else{
        showWarning("Credentials don't match")
      }
    }
  }

  const validPassword = (e) =>{
    if(password !== e){
      showWarning("passwords don't match")
      return
    }
    showWarning('')
    setConfirmedPassword(e)
  }

  return (
    <updateContext.Provider value={[updater, setUpdater]}>

      {
        user ? 
          <div className="App">
            <Header />
            <div className="container">
              <div className="feed">
                <CreatePost />
                <Posts />
              </div>
              <Sidebar />
            </div>
          </div>
        :
        (
          login ?
          <div className="auth">
            <input type="text" placeholder="Username" onChange={(e)=>setUsername(e.target.value)} />
            <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} />
            <button onClick={auth}>Sign In</button>
            <p style={{color: '#444', cursor: 'pointer'}} onClick={()=>setLogin(false)}>Need an account?</p>
          </div>
          :
          <div className="auth">
            <input type="text" placeholder="Username" onChange={(e)=>setUsername(e.target.value)} />
            <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} />
            <input type="password" placeholder="Confirm Password" onChange={(e)=>validPassword(e.target.value)} />
            {
              warning !== '' &&
              <p style={{color: 'red'}}>{warning}</p>
            }

            <button onClick={auth}>Sign Up</button>
            <p style={{color: '#444', cursor: 'pointer'}} onClick={()=>setLogin(true)}>Got an account?</p>
          </div>
        )
      }
    </updateContext.Provider>
  );
}

export default App;
