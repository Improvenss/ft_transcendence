// Bu ornekte 'Type Aliases & Interfaces' ogrenecegiz.
//-------------------------
// Type Aliases alani.
// Hepsinin tipini teker teker belirtiyoruz.
type DogBreeds = string; // 'string'.
type DogAge = number;
type DogName = string;
type Dog = {
	breeds: DogBreeds,
	age: DogAge,
	name: DogName
};
// Simdi burada tanimlarmalari yapiyoruz.
const dogBreeds: DogBreeds = "Jack Russel";
const dogAge: DogAge = 6;
const dogName: DogName = "Minnos";
const dog: Dog = {
	breeds: dogBreeds,
	age: dogAge,
	name: dogName
};

console.clear();
console.log("dog:", dog);
console.log("dogBreeds:", dogBreeds);
console.log("dogAge:", dogAge);
console.log("dogName:", dogName);

//------------------------
// Interface alanina gectik.

/**
 * Burada 'interface' tanimliyoruz. Burada type'lerinin
 *  atamalarini yapiyoruz.
 */
interface department{
	department: string,
	classNumber: number
};

// Burasi tanimlanan 'interface'nin devamina eklenilmis hali.
interface student extends department{
	name: string,
	surname: string,
	age: number
};

const gorkem: student = {
	name: "Gorkem",
	surname: "SEVER",
	age: 22,
	department: "Software Engineering",
	classNumber: 31 // sj :D
};

console.log(gorkem);