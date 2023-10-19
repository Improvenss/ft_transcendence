import React from "react";

function	OldArray()
{
	const vehicles = ['mustang', 'f-150', 'expedition'];

	// old way
	const car = vehicles[0];
	const truck = vehicles[1];
	const suv = vehicles[2];
	return (
		<h4>{vehicles}</h4>
	);
}

function	NewArray()
{
	const vehicles = ['mustang', 'f-150', 'expedition'];

	const [car, truck, suv] = vehicles;
	return (
		<h4>{vehicles}</h4>
	);
}

function	NewEmptyArray()
{
	const vehicles = ['mustang', 'f-150', 'expedition'];

	const [car,, suv] = vehicles;
	return (
		<h4>{vehicles}</h4>
	);
}

function	Array()
{
	return (
		<div>
			<p>{OldArray()}</p>
			<p>{NewArray()}</p>
			<p>{NewEmptyArray()}</p>
		</div>
	);
}

export default	Array;