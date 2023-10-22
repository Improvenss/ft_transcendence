import React from "react";
import { Link, Router, Route } from "react-router-dom";
import Countdown from "../login/Countdown";

function	HomePage()
{
	return (
		<div className="c-home-page">
			<div>{Countdown()}</div>
			<div>Pong game PLAY page.</div>
		</div>
	);
};

export default	HomePage;