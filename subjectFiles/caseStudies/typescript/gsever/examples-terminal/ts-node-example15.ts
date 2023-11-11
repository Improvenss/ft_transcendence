// Burada 'Utility Types'leri ogrenecegiz.
interface	StudentTypes
{
	name: string;
	surname: string;
	born: number;
	optional?: any; // Isterse tanimlar, tanimlarsa da istedigi tipte tanimlasin.
};

/**
 * 'Partials' bu type ile kullanilan bir objeyi 'istege bagli'
 *  olarak degistirir.
 * Sen tanimlasan da tanimlamasan da bir sey olmaz.
 */
let	partialStudent1: Partial<StudentTypes> = {
	name: "Gorkem",
	surname: "SEVER"
};
/**
 * 'Required' bu type ile kullanilan bir objeyi 'zorunlu olarak'
 *  tanimlamani gerektiren sekilde olmasini saglar.
 * Sen tanimlamadan gecemezsin, yoksa error yersin.
 */
// let	requiredStudent1: StudentTypes = {
let	requiredStudent1: Required<StudentTypes> = {
	name: "Gorkem",
	surname: "SEVER",
	born: 1900,
	optional: "BLUP BLUP NIBBA"
};
/**
 * 'Record' bu type ile kullanilan bir objeyi 'spesifik olarak'
 *  ilk parametresini ilk olan, ikinci parametresini ikinci olan
 *  olarak otomatik belirler.
 * Record<string, number> is equivalent to { [key: string]: number }
 * Bununla esdegerdir.
 */
let	defaultNameAgeMap: {[asdf: string]: number} = {
	'Dobbe': 31,
	'Doge': 42
}
let	recordNameAgeMap: Record<string, number> = {
	'Gorkem': 22,
	'Ahmet': 25,
	'Umut': 22,
	'Doge': 8
};
/**
 * 'Omit' bu type ile kullanilan bir objeyi 'keyleri kaldir'
 *  olarak tanimlarsak; bu tip interface'sinden belirttign
 *  keyleri kaldirir.
 */
let	omitNameAgeMap: Omit<StudentTypes, 'surname' | 'born' | 'optional'> = {
	name: "GorkemBruh",
	// surname: "asdf"; // Bu key'i kaldirdigimiz icin tanimlayamayiz.
};
/**
 * 'Pick' bu type ile kullanilan bir objeyi 'belirtilen harici hepsini kaldir'
 *  olarak dusunebiliriz.
 */
let	pickNameAgeMap: Pick<StudentTypes, 'born'> = {
	// name: "GorkemBRUHman",
	// surname: "SEVER",
	born: 1900, // Bu haricindeki hepsini kaldirdigimiz sadece bunu tanimlayabiliyoruz.
	// optional: "BLUP BLUP NIBBA"
};
/**
 * 'Exclude' bu type ile kullanilan bir objeyi "belirttigimiz key'i kaldir"
 *  olarak dusunebiliriz.
 */
type	Primitive = string | number | boolean;
// Buradan 'string' tipini kaldirdik, haricindeki kalan tiplerle tip atayarak kullanabiliriz.
let	excludePrimitive: Exclude<Primitive, string> = true;
let	excludePrimitive2: Exclude<Primitive, string> = 31;
/**
 * 'ReturnType' bu type ile kullanilan bir objeyi 'function belirtilen tipte return yapacak'
 *  seklinde tanimlamamizi sagliyor.
 */
type	PointGenerator = () => {x: number, y: number};
let	returntypePointGenerator: ReturnType<PointGenerator> = {
	x: 31,
	y: 42,
	// z: 235 // Bunu kullanamiyoruz.
};
/**
 * 'Parameters' bu type ile kullanilan bir objeyi "array'in her indexindeki tipi al buna koy"
 *  seklinde dusunebiliriz.
 * Ne yapiyor; Bizim onceden hazirlanmis type'mizdeki ipleri
 *  aliyor ve kullandigimiz yere cikartiyor(koyuyor).
 */
type	PointPrinter = ( p: { x: number, y: number }) => void;
const	parametersPointPrinter: Parameters<PointPrinter>[0] = {
	x: 10,
	y: 20,
	// z: 235 // z yok sanirim ondan tanimlayamiyoruz bu ne yaw.
};
/**
 * 'Readonly' bu da 'atama yapildiktan sonra degistirilemezler'
 *  olarak dusunebiliriz.
 * Salt okunur yapiyoruz cunku.
 */
const	readonlyStudent1: Readonly<StudentTypes> = {
	name: "Gorkem",
	surname: "SEVER",
	born: 1800,
	optional: "BUM BE YARr.."
};

console.clear();
console.log(partialStudent1); // { name: 'Gorkem', surname: 'SEVER' }
console.log(requiredStudent1); // { name: 'Gorkem', surname: 'SEVER', born: 1900, optional: 'BLUP BLUP NIBBA' }
console.log(defaultNameAgeMap); // { Dobbe: 31, Doge: 42 }
console.log(recordNameAgeMap); // { Gorkem: 22, Ahmet: 25, Umut: 22, Doge: 8 }
console.log(omitNameAgeMap); // { name: 'GorkemBruh' }
console.log(pickNameAgeMap);
console.log(excludePrimitive, excludePrimitive2); // true 31
console.log(returntypePointGenerator); // { x: 31, y: 42 }
console.log(parametersPointPrinter); // { x: 10, y: 20 }
// readonlyStudent1.name = "DOBBE"; // error TS2540: Cannot assign to 'name' because it is a read-only property.
console.log(readonlyStudent1); // { name: 'Gorkem', surname: 'SEVER', born: 1800, optional: 'BUM BE YARr..' }