let message: string = "Hello World This From TypeScript!"; // Burada mesajimizi olusturduk.
let head1 = document.createElement("h1"); // Burada bir tane HTML'in <h1> elementini olusturduk.

head1.textContent = message; // Burada bu <h1> elementinin icerisine 'message'mizi ekledik.

// Sonucunda bunu yapmis olduk;
// <h1>Hello World This From TypeScript!</h1>

document.body.appendChild(head1); // Burada da bu '<h1>' elementimizi HTML document'ine ekledik.

// Sonra bunu '$> tsc main.ts' olacak sekilde derledigimizde web browserimizden
//  index.html dosyasini calistirarak test edebiliriz.

// Eger HTML dosyasinda degil de normal 'terminal'den calistirmak istedigimizde
//  $> tsc main.ts
//  $> node main.js
//  yaptiktan sonra ciktisini terminalimizden gorebiliriz.

// Bu 2 adimla ugrasmak istemedigimiz zaman sadece 1 adimla calistirmak icin
//  hatta hic .js dosyasi olusturmadan calistirmak icin bunu yapabiliriz;
//  $> 