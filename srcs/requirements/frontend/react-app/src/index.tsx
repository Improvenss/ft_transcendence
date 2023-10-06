import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OldLogin from './login/OldLogin';
import ForwardedPage from './login/ForwardedPage';
// npm install react-router-dom

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
  <BrowserRouter>
    {/* <OldLogin/> */}
    <ForwardedPage/>
  </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

/**
 * How can i install 'single-page-application'?
 * LINK: https://www.codingninjas.com/studio/library/create-a-single-page-application-with-reactjs-in-cherrypy
 * Current working directory must be 'react-app';
 * $> npm install react-router-dom
 */

/**
 * BrowserRouter, Route ve Link React Router DOM kütüphanesinin bileşenleridir ve tek sayfa uygulamalarında (Single Page Applications - SPA) sayfalar arasında gezinme işlemlerini yönetmek için kullanılırlar1234.
 * BrowserRouter: HTML5 History API üzerine kurulmuştur1. Sayfa yönlendirmelerini tutan ana bileşendir1. Route yapısı kullanılacak tüm bileşenler / sayfalar BrowserRouter arasında olmak zorundadır1.
 * Route: Bir sayfayı uygulamaya eklemek için kullanılır1. Sayfa adresi (url) ve o sayfada çalıştırılacak bileşeni (component) değer olarak alır1.
 * Link: Bir sayfaya link vermek için kullanılan bileşendir1. Sayfa adresini alır. Kullanımı HTML A Etiketi gibidir. Fakat A etiketinde olduğu gibi sayfa yenilenmesi olmaz1.
 * Bu bileşenler, uygulamanızın farklı sayfalar arasında geçiş yapabilmesini sağlar.
 */