import React, { useState } from "react";

async function addData(setData: { (value: React.SetStateAction<null>): void; (arg0: any): void; }) {
	const response = await fetch("https://localhost:3000/users", {
		method: "POST",
		body: JSON.stringify({
			id: 4,
			name: "Gorkem"
		})
	})
	const data = await response.json();
	setData(data); // Veri alındığında setData fonksiyonunu çağır
}

function Add() {
	const [data, setData] = useState(null);

	function increment() {
		addData(setData); // setData fonksiyonunu addData'ya parametre olarak geçir
	}

	return (
		<div>
			<p>id: Currently Empty</p>
			{data && <p>{data}</p>}
			<button onClick={increment}>id: +1</button>
		</div>
	);
}

export default Add;
