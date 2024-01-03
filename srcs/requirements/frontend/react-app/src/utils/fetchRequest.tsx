import Cookies from "js-cookie";

async function fetchRequest(request: {
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
	headers?: Record<string, string> | undefined,
	body?: BodyInit | undefined,
	url: string,
}, cookie: boolean = true){
	const userCookie = Cookies.get("user");
	const headers: Record<string, string> = {
		...request.headers,
	};

	if (request.body !== undefined && !(request.body instanceof FormData)) {
		headers['Content-Type'] = 'application/json';
	}

	// if (request.body instanceof FormData)
	// 	delete headers['Content-Type'];

	if (cookie === true){
		headers['Authorization'] = 'Bearer ' + userCookie;
	}

	const response = await fetch(process.env.REACT_APP_FETCH + request.url, {
		method: request.method,
		headers: (request.headers ? request.headers : headers),
		body: request.body,
	});
	return (response);
}

export default fetchRequest;