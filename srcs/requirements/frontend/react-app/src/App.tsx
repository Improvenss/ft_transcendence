import React from "react";
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import HomePage from "./main/HomePage";
import Api from "./login/Api";
import NoMatchPage from "./main/NoMatchPage";
import LoginPage from "./login/LoginPage";
import Cookies from 'js-cookie';
import ChatPage from "./chat/ChatPage";
import { useAuth } from './login/AuthHook';
import { ReactComponent as GithubIcon } from './github.svg';

function App() {
  console.log("---------APP-PAGE---------");
  const { isAuth, setAuth } = useAuth();

  function logOut() {
    setAuth(false);
    Cookies.remove('user');
    localStorage.removeItem('user');
    return <Navigate to='/login' replace />; //geri butonuna basınca mal olmasın diye ekleniyor
  }

  return (
    <div id="id-app">
      <header>
        {isAuth ? (
          <ul id='bar'>
            <Link to='/' className="site-name">TRANSCENDENCE</Link>
            <Link to="/">Home</Link>
            <Link to="/chat">Chat</Link>
            <span onClick={logOut}>Logout</span>
          </ul>
        ) : (
          <nav>
            <a href="https://github.com/Improvenss/ft_transcendence">
              <GithubIcon className="github-icon" />
            </a>
          </nav>
        )}
      </header>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/chat' element={<ChatPage />} />
        <Route path='*' element={<NoMatchPage />} />
        <Route path='/api' element={<Api />} />
        <Route path='/login' element={<LoginPage />} />
      </Routes>
    </div>
  );
};

export default App;
