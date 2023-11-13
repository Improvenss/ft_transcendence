import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Burada sadece bunu import etmemiz gerekiyor, cunku tarayici rotasi olara geciyor.
import './index.css';
import App from './App';
import { CookiesProvider } from 'react-cookie';
// npm install react-router-dom

/**
 * Burasi ana function olarak geciyor.
 * Biz SPA(Single Page Application) yazabilmemiz icin;
 *  'react-router-dom'u kurmamiz gerekiyor. Sonra;
 *  <BrowserRouter>
 *   Arasina yazmamiz gerekiyor her seyi.
 *  </BrowserRouter>
 * 
 * TODO: 2 tane msg gondermeyi engelle.
 * TODO: Kullanici adlarini koy.
 * TODO: User list yap.
 * TODO: Channel list yap.
 * TODO: Channel olustururken; ChatPage.tsx'te olacak ama function
 *  implementation'larini(definition) ayri bir 'Channel.tsx' dosyasinda yaz.
 * TODO: Sol & Sag mesajlari genisligini sinirla.
 * TODO: Mesajlari 'await' ile synchronize hale getir.
 * TODO: /chat baglaninca otomatik bir sekilde /chat/#global yonlendirilecek.
 * TODO: Kaka yaptiktan sonra dislerini fircalamayi unutma. :D
 */
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <CookiesProvider>
      <BrowserRouter>
        <App/>
      </BrowserRouter>
    </CookiesProvider>
  </React.StrictMode>
);

/**
 * Kurulan paketler sirasiyla;
 * 
 * npm install --save-dev react-cookie -> Cookie kullanimi icin kullandigimiz kutuphane.
 * npm install --save-dev @types/js-cookie
 * npm install js-cookie -> Cookie.set() fonksiyonu icin.
 */

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
 * BrowserRouter, Route ve Link React Router DOM kütüphanesinin bileşenleridir ve tek sayfa uygulamalarında (Single Page Applications - SPA) sayfalar arasında gezinme işlemlerini yönetmek için kullanılırlar.
 * BrowserRouter: HTML5 History API üzerine kurulmuştur. Sayfa yönlendirmelerini tutan ana bileşendir. Route yapısı kullanılacak tüm bileşenler / sayfalar BrowserRouter arasında olmak zorundadır.
 * Route: Bir sayfayı uygulamaya eklemek için kullanılır. Sayfa adresi (url) ve o sayfada çalıştırılacak bileşeni (component) değer olarak alır.
 * Link: Bir sayfaya link vermek için kullanılan bileşendir. Sayfa adresini alır. Kullanımı HTML A Etiketi gibidir. Fakat A etiketinde olduğu gibi sayfa yenilenmesi olmaz.
 * Bu bileşenler, uygulamanızın farklı sayfalar arasında geçiş yapabilmesini sağlar.
 */