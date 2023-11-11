// Bu ornekte 'Enum'lari ogreniyoruz.
enum cardinalDirections {
	North, // Kuzey
	South, // Guney
	East, // Dogu
	West // Bati
};
enum initializedDirections {
	North = 42, // Kuzey
	South, // Guney
	East, // Dogu
	West // Bati
};
enum fullyInitializedDirections {
	North = 42, // Kuzey
	South = 31, // Guney
	East = "asdf", // Dogu
	West = "Dobbe" // Bati
};

console.clear();
console.log("North:", cardinalDirections.North);
console.log("South:", cardinalDirections.South);
console.log("East:", cardinalDirections.East);
console.log("West:", cardinalDirections.West);

/**
 * Burada boyle bir atama yapamiyoruz, bu 'enum' senin
 *  tanimladigin sekilde kendisi 0, 1, 2, 3... olarak devam ediyor.
 * Bu 'enum'larda ilk 'init' asamasinda degerler atanir.
 * Enum disarisinda bu enum'a deger atama gerceklesemez.
 */
// cardinalDirections.North = "asdf";

console.log();
console.log("North:", initializedDirections.North);
console.log("South:", initializedDirections.South);
console.log("East:", initializedDirections.East);
console.log("West:", initializedDirections.West);

console.log();
console.log("North:", fullyInitializedDirections.North);
console.log("South:", fullyInitializedDirections.South);
console.log("East:", fullyInitializedDirections.East);
console.log("West:", fullyInitializedDirections.West);