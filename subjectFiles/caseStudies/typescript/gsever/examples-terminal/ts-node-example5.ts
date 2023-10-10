// Burada 'named tuple' nasil onu goreniyoruz.
let car: [name: string, year: number];

console.clear();
car = ["Nissan", 1998];
console.log(car);

// -----------

let noNamedCar: [string, number];

noNamedCar = ["Toyota", 1999];
let [x, y] = noNamedCar;
console.log(x, y);
console.log(x + ' ' + y);