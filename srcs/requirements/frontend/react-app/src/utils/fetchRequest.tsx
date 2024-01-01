import Cookies from "js-cookie";

const userCookie = Cookies.get("user");

const fetchRequest = async (request: {
	method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
	headers?: Record<string, string> | undefined,
	body?: BodyInit | undefined,
	url: string,
}, cookie: boolean = true) => {
	const headers: Record<string, string> = {
		...request.headers,
	};

	if (cookie === true){
		headers['Authorization'] = 'Bearer ' + userCookie;
	}

	if (request.body !== undefined) {
		if (!(request.body instanceof FormData))
			headers['Content-Type'] = 'application/json';
	}

	const response = await fetch(process.env.REACT_APP_FETCH + request.url, {
		method: request.method,
		headers: headers,
		body: request.body,
	});

	return (response);
}

export default fetchRequest;