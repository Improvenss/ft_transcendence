import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './hooks/AuthHook';
import { SocketProvider } from './hooks/SocketHook';
import { UserProvider } from './hooks/UserHook';
import { FontLoadedProvider } from './hooks/LoadHook';
import { StatusProvider } from './hooks/StatusHook';

/**
 * Burasi ana function olarak geciyor.
 * Biz SPA(Single Page Application) yazabilmemiz icin;
 *  'react-router-dom'u kurmamiz gerekiyor.
 * $> npm install react-router-dom
 * Sonra;
 *  <BrowserRouter>
 *   Arasina yazmamiz gerekiyor her seyi.
 *  </BrowserRouter>
 * Ekstra----------------------------------------------
 * TODO: notification'da tüm bildirileri sil butonu ekle 
 * TODO: channelar silinince resimlerinide sil
 * TODO: Her hata durumu için kullanıcıya bildiri gönder
 * TODO: Channel'daki veya game'deki eventleri kullancılara bildiri olarak gönder
 * TODO: eğer kullanıcı arkadaşlık isteği attıysa birdaha gönderemessin
 * ----------------------------------------------------
 * TODO: profilePage'de friends bölümüne arkadaşlıktan çıkar ekle, başka birinin profiline gidincede buton olarak ekle
 * TODO: profilePage'de avatar olmasada null olarak gözüküyor
 * TODO: DM'yi yap
 * TODO: 2 adımlı doğrulamayı ekle
 * TODO: Game'den sonra profilePage'yi güncelle
 * TODO: Game için model/mod eklenecek
 * TODO: Oyun için level ladder ekle
 * ---->
 * 		const startTime = new Date();
		const endTime = new Date();
		console.log(`findUser execution time: ${endTime.getTime() - startTime.getTime()} milliseconds`);
 * 
 */
const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);
root.render(
	<FontLoadedProvider>
		<AuthProvider>
			<UserProvider>
				<SocketProvider>
						{/*<React.StrictMode>*/}
							<BrowserRouter>
								<StatusProvider>
									<App />
								</StatusProvider>
							</BrowserRouter>
						{/*</React.StrictMode>*/}
				</SocketProvider>
			</UserProvider>
		</AuthProvider>
	</FontLoadedProvider>
);

/**
 * Kurulan paketler sirasiyla;
 * 
 * @OK npm install --save socket.io-client
 * NOK npm install --save react-cookie -> Cookie kullanimi icin kullandigimiz kutuphane.
 * @OK npm install --save-dev @types/js-cookie
 * @OK npm install js-cookie -> Cookie.set() fonksiyonu icin.
 */

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

/**
 * How can i install 'single-page-application'?
 * LINK: https://www.codingninjas.com/studio/library/create-a-single-page-application-with-reactjs-in-cherrypy
 * Current working directory must be 'react-app';
 * $> npm install react-router-dom
 */

/**
 * BrowserRouter, Route ve Link React Router DOM kütüphanesinin bileşenleridir ve tek sayfa uygulamalarında (Single Page Applications - SPA) sayfalar arasında gezinme işlemlerini yönetmek için kullanılırlar.
 * BrowserRouter: HTML5 History API üzerine kurulmuştur. Sayfa yönlendirmelerini tutan ana bileşendir. Route yapısı kullanılacak tüm bileşenler / sayfalar BrowserRouter arasında olmak zorundadır.
 * Route: Bir sayfayı uygulamaya eklemek için kullanılır. Sayfa adresi (url) ve o sayfada çalıştırılacak bileşeni (component) değer olarak alır.
 * Link: Bir sayfaya link vermek için kullanılan bileşendir. Sayfa adresini alır. Kullanımı HTML A Etiketi gibidir. Fakat A etiketinde olduğu gibi sayfa yenilenmesi olmaz.
 * Bu bileşenler, uygulamanızın farklı sayfalar arasında geçiş yapabilmesini sağlar.
 */