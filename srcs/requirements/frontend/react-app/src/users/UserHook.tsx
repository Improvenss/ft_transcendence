import { useState } from 'react';

export function useLogin() {
	const [login, setLogin] = useState('');

	return { login, setLogin };
}
