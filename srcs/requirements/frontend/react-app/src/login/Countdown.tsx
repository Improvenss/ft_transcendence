/**
 * Updating countdown.
 */
import React, { useEffect, useState } from 'react';

function Countdown() {
    const [time, setTime] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(Date.now());
        }, 10);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="login-page">
            Burasi bir text
            <div id="countdown">{time}</div>
        </div>
    );
};

export default Countdown;
