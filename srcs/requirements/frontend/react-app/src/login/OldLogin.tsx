import React, { useState, useEffect, ChangeEvent, FocusEvent } from 'react';
import './Countdown.css'; // Stil dosyasını import ediyoruz

function OldLogin() {
    const [time, setTime] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [password, setPassword] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        const launch = new Date('2019-03-07T17:00:00.000Z');
        const interval = setInterval(() => {
            const now = new Date();
            const diff = (launch.getTime() - now.getTime()) / 1000;

            setTime({
                days: Math.floor(diff / (60 * 60 * 24)),
                hours: Math.floor(diff % (60 * 60 * 24) / (60 * 60)),
                minutes: Math.floor(diff % (60 * 60) / 60),
                seconds: Math.floor(diff % 60)
            });
        }, 1000); // Her 1 saniyede bir güncelle

        return () => clearInterval(interval); // Bileşen temizlendiğinde interval'i durdur
        // return (Date.now());
    }, []);

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
    }

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    }

    return(
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

            <form method="post" action="/password" id="login_form" acceptCharset="UTF-8" className="storefront-password-form">
                <input type="hidden" name="form_type" value="storefront_password" />
                <input type="hidden" name="utf8" value="✓" />

                <div className={`password__field ${isFocused ? 'password__field--focused' : ''}`}>
                    <input
                        className='password__input'
                        type='password'
                        name='password'
                        placeholder='password'
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onChange={handleChange}
                    />
                    <input className='password__button' type='submit' value='→' disabled={password === ''} />
                </div>
            </form>
        </div>
    );
}

export default OldLogin;
