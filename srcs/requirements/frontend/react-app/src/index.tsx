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
 * 
 * TODO: notification'da tüm bildirileri sil butonu ekle
 * TODO: profilePage'de friends bölümüne arkadaşlıktan çıkar ekle, başka birinin profiline gidincede buton olarak ekle
 * TODO: backend'den çoğu yapıyı tek formatta çek yani ne gerekiyorsa onu al
 * TODO: frontend'de notif'ler okunduğu zaman bazen okundu olarak işaretlemiyor bugta kalıyor
 * TODO: chat kanal üstüne tıklayınca kapanmıyor.
 * TODO: database'ye birşeyleri kayıt ederken boş mu değil mi kontrol et. (Derleme aşamasında birşeyler kaydedince etksik kayıt oluyor.)
 * TODO: mesaj gönderirken bazen author boş oluyor, neden nasıl idk.
 * TODO: channel'dan levae yapıp, login yaptıktan hemen sonra channel'ün tıklayıp kapatıp açınca hata veriyor (güncelleme yaparken yavaş kaldığı için olduğunu düşünüyorum.)
 * TODO: channelar silinince resimlerinide sil
 * TODO: arada bir user socketini bulamıyor neden idk
 * TODO: channel info'daki güncellemeler düzeltilmedi
 * TODO: channel joinleme olayını frontend'e aktarılabilir idk
 * TODO: userinput'un güncelle - tek method haline getir
 * TODO: activechannels'ı doğrudan channels bloğundan çekebilirsin
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
			<SocketProvider>
				<UserProvider>
						{/*<React.StrictMode>*/}
							<BrowserRouter>
								<StatusProvider>
									<App />
								</StatusProvider>
							</BrowserRouter>
						{/*</React.StrictMode>*/}
				</UserProvider>
			</SocketProvider>
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