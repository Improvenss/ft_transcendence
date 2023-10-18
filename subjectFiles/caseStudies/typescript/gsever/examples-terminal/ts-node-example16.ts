// Burada 'Keyof' kullanimini gorecegiz.

import { createECDH } from "crypto";

// Keyof with excliptid keys
interface	StudentTypes {
	name: string,
	surname: string,
	born: number,
	gender: string,
	isRegistered: boolean
};
/**
 * Burada 'keyof' olarak kullandigimiz anahtar kelimemiz,
 *  tanimladigimiz ismi tutuyor.
 * 
 * name: string
 * 
 * Olarak tanimlanmissa burada 'keyof' dedigimizde 'key'
 *  'name' olmus oluyor.
 * 
 * @param student 
 * @param key 
 */
function	printStudentKeys( student: StudentTypes, key: keyof StudentTypes )
{
	console.log(student[key]);
};
// Keyof with index signatures
type	StringMap = { [key: string]: unknown };
function	createStringPair( property: keyof StringMap, value: string ): StringMap
{
	return ({ [property]: value });
}

let	student1: StudentTypes = {
	name: "Gorkem",
	surname: "SEVER",
	born: 1990,
	gender: "male",
	isRegistered: false
}
let	myProperty = createStringPair("California", "Los Angeles");

console.clear();
printStudentKeys(student1, "name"); // Gorkem
printStudentKeys(student1, "surname"); // SEVER
printStudentKeys(student1, "born"); // 1990
printStudentKeys(student1, "gender"); // male
printStudentKeys(student1, "isRegistered"); // false
console.log(myProperty); // { California: 'Los Angeles' }