import React from "react";

const	normalFunction = function()
{
	return (<h2>normalFunction</h2>);
}

const	arrowFunction = () =>
{
	return (<h2>arrowFunction</h2>);
}

const	shortArrowFunction = () => <h2>shortArrowFunction</h2>;

const	shortArrowFunctionParameter = ( arg: string, arg2: number ) =>
	<h2>{ "shortArrowFunctionParameter: -> " + arg + arg2 }</h2>;

const	shortArrowFunctionOneParameter = ( arg: string )=>
	<h2>{"shortArrowFunctionParameter: -> " + arg }</h2>

function	ES6()
{
	return (
		<div>
			{normalFunction()}
			{arrowFunction()}
			{shortArrowFunction()}
			{shortArrowFunctionParameter("Gorkem", 31)}
			{shortArrowFunctionOneParameter("Gorkem")}
		</div>
	);
}

export default ES6;