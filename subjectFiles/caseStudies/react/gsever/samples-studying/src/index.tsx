// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';

// const root = ReactDOM.createRoot(
//   document.getElementById('root') as HTMLElement
// );
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ES6 from "./ES6/ES6";
import Array from "./ES6/ES6Array";

// const myFirstElement = <h1>Benim ilk elementimmis.</h1>;

const container = document.getElementById("root") as HTMLElement; // Burada <div>'imizin root ismindeki elementini aliyoruz.
const root = ReactDOM.createRoot(container); // Burada DOM icin tekrardan elementimizi olusturuyoruz.
// root.render(myFirstElement); // Burada artik render ediyoruz.
root.render(<App/>);
// root.render(<ES6/>);
// root.render(<Array/>);