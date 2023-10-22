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

function	SpreadOperatorArray()
{
	const numbersOne = [1, 2, 3];
	const numbersTwo = [4, 5, 6];
	const numbersCombined = [...numbersOne, ...numbersTwo];

	return (
		<h4>{numbersCombined}</h4>
	);
}

function	SpreadOperatorRestArray()
{
	const numbers = [1, 2, 3, 4, 5, 6];

	const [one, two, ...rest] = numbers;
	return (
		<h4>{numbers}</h4>
	);
}

function	SpreadOperatorObjectArray()
{

	const myVehicle = {
		brand: 'Ford',
		model: 'Mustang',
		color: 'red'
	}

	const updateMyVehicle = {
		type: 'car',
		year: 2021, 
		color: 'yellow'
	}

	const myUpdatedVehicle = {...myVehicle, ...updateMyVehicle}
	return (
		<div>
			<h4>My Updated Vehicle</h4>
			<p>Brand: {myUpdatedVehicle.brand}</p>
			<p>Model: {myUpdatedVehicle.model}</p>
			<p>Color: {myUpdatedVehicle.color}</p>
			<p>Type: {myUpdatedVehicle.type}</p>
			<p>Year: {myUpdatedVehicle.year}</p>
		</div>
	);
}

function	Array()
{
	return (
		<div>
			<p>{OldArray()}</p>
			<p>{NewArray()}</p>
			<p>{NewEmptyArray()}</p>
			<p>{SpreadOperatorArray()}</p>
			<p>{SpreadOperatorRestArray()}</p>
			<p>{SpreadOperatorObjectArray()}</p>
		</div>
	);
}

export default	Array;