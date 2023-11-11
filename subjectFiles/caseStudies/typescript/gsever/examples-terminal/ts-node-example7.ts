/**
 * Buradaki 'Index Signatures' denemesinde;
 *  [index: string] -> Aldigi variable'nin tipi 'string' ve
 *   degeri 'number' olacagini belirtiyor.
 * ornegin;
 * 
 */
let nameAgeMap: { [index: string]: number } = {};

nameAgeMap.Gorkem = 22;
// nameAgeMap.Ahmet = "asdf"; // Burasi olamaz cunku bu variable 'number' tipi olabilir.
console.clear();
console.log(nameAgeMap);