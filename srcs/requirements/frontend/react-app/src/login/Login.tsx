// import React from 'react';
// import './Login.css';

// const image = {
//   src: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/26bcbe81-a3fa-43da-8b10-7b37ce15b07d/demdz12-032fbb3e-a07e-4f59-bc26-4fdda3013cb8.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzI2YmNiZTgxLWEzZmEtNDNkYS04YjEwLTdiMzdjZTE1YjA3ZFwvZGVtZHoxMi0wMzJmYmIzZS1hMDdlLTRmNTktYmMyNi00ZmRkYTMwMTNjYjguZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.3HR9CuV_J6urOo8jsHjFtfjoXPtDhLEFgUT6Si5Gkro",
//   // src: "https://media.tenor.com/2F09sVRlG_IAAAAC/happiness-pokemon.gif",
// };
 
// // Duvar kağıdının CSS stillerini oluşturun
// const wallpaper = {
//   width: "100vw", //ekran genişliği kadar
//   height: "100vh", // ekran yüksekliği kadar
//   backgroundImage: `url(${image.src})`,
//   backgroundRepeat: "no-repeat",
//   backgroundPosition: "center", // eğerki sekme soldaysa top left yap
//   backgroundSize: "cover",
// };

// function Login() {
//   return (
//     <div className='Login' style={wallpaper}>
// 		  <div class="password__timer">
//     <div class="password__value password__value--day"></div>
//     <div class="password__key password__key--day">d</div>
//     <div class="password__value password__value--hour"></div>
//     <div class="password__key password__key--hour">h</div>
//     <div class="password__value password__value--minute"></div>
//     <div class="password__key password__key--minute">m</div>
//     <div class="password__value password__value--second"></div>
//     <div class="password__key password__key--second">s</div>
//   </div>
//     </div>
//   );
// }

// export default Login;

import React, { useEffect, useState } from 'react';
import './Countdown.css';

const CountdownTimer: React.FC = () => {
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const launch = new Date('2019-03-07T17:00:00.000Z');
    const intervalId = setInterval(() => {
      const now = new Date();
      const diff = (launch.getTime() - now.getTime()) / 1000;

      setTime({
        days: Math.floor(diff / (60 * 60 * 24)),
        hours: Math.floor((diff % (60 * 60 * 24)) / (60 * 60)),
        minutes: Math.floor((diff % (60 * 60)) / 60),
        seconds: Math.floor(diff % 60),
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className='password'>
      <div className='password__timer'>
        <div className='password__value password__value--day'>{time.days}</div>
        <div className='password__key password__key--day'>d</div>
        <div className='password__value password__value--hour'>{time.hours}</div>
        <div className='password__key password__key--hour'>h</div>
        <div className='password__value password__value--minute'>{time.minutes}</div>
        <div className='password__key password__key--minute'>m</div>
        <div className='password__value password__value--second'>{time.seconds}</div>
        <div className='password__key password__key--second'>s</div>
      </div>
    </div>
  );
};

export default CountdownTimer;
