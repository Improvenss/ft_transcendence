/** Bu [] ile {} arasinda farklar varidir.
 * [] -> tuple ya da array olarak kullanilir. Init etme asamasinda
 *  isimsiz init edilir.
 * ornegin; let asdf: [name: string, age: number] = ["Gorkem", 22];
 * {} -> object(nesne) olarak kullanilir. Init etme asamasinda
 *  ismiyle birlikte init edilir.
 * ornegin; let asdf: {name: string, age: number} = {
 * 	name: "Gorkem",
 * 	age: 22
 * };
 * 
 */

let car: {type: string, model: string, year: number} = {
	type: "Toyota",
	model: "Supra",
	year: 2000
};

let dog: {breeds: string, age: number, name?: string} = {
	breeds: "Jack Russel",
	age: 6
};

let asdf: [name: string, age: number] = ["Gorkem", 22];

console.clear();
car.model = "asdf";
console.log(car);
/**
 * dog.name = "Minnos"; // Burasi olmasa da error vermeyecek cunku
 * 'name?: string' olarak olusturduk.
 */
dog.name = "Minnos";
console.log("Burasi {} object.", dog);
console.log("Burasi [] tuple.", asdf);

// const car: { type: string, mileage?: number } = { // no error
// 	type: "Toyota"
// };
// car.mileage = 2000;
// console.clear();
// console.log(car);