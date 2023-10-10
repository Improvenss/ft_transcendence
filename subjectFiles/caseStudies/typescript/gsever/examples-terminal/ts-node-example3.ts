console.clear(); // Terminalimizin onceki yazilanlarini temizliyoruz ki gozumuz karismasin.
const numbers = [1, 2, 3]; // Burada tipini belirtmedigimiz halde ona atadigimiz tiplerden hangi tip oldugunu anliyor.
let balloon: number[];

numbers.push(42); // Burada number tipinde oldugunu bildigi icin number tipinde atama yapabiliyoruz.
// numbers.push("asdf"); // Burada string tipinde deger atadigimiz icin boyle bir deger atanamayacagi icin error verir.
console.log(numbers);
// let balloon: number[] = numbers;
balloon = numbers;
console.log(balloon);