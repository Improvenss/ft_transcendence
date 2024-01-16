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

	if (cookie === true){
		headers['Authorization'] = 'Bearer ' + userCookie;
	}

	// console.log("method", request.method);
	// console.log("headers", request.headers);
	// console.log("body", request.body);
	// console.log("url", request.url);

	const response = await fetch(process.env.REACT_APP_FETCH + request.url, {
		method: request.method,
		headers: headers,
		body: (request.body ? request.body : undefined),
	});
	return (response);
}

export default fetchRequest;