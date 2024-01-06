export function isValidImage(file: File): { status: true } | { status: false; err: string } {
	const errMessage = {
		imageSize: 'Image size exceeds the limit (3 MB max). Please choose a smaller image.',
		fileType: 'Please choose a valid image file.',
   		fileExtension: 'Invalid file type. Please choose a valid image file (jpg, jpeg, png, gif).',
	}
	// Dosya boyutu kontrolü
	const maxSize = 3 * 1024 * 1024; // 3 MB
	if (file.size > maxSize) {
		console.error(errMessage.imageSize);
		return {status: false, err: errMessage.imageSize}
	}

	// Dosya türü kontrolü (MIME tipi)
	if (!file.type.startsWith('image/')) {
		console.error(errMessage.fileType);
		return {status: false, err: errMessage.fileType}

	}

	// Dosya türü kontrolü
	//const allowedExtensions = /\.(jpg|jpeg|png|gif)$/i; // sondaki /i büyük küçük harf duyarlılığı sağlıyor.
	const allowedExtensions = /\.(jpg|jpeg|png|gif)$/;
	if (!allowedExtensions.test(file.name)) {
		console.error(errMessage.fileExtension);
		return {status: false, err: errMessage.fileExtension}
	}

	return {status: true};
}