import React, { createContext, useContext, useEffect, useState } from 'react';
import LoadingPage from '../utils/LoadingPage';

const FontLoadedContext = createContext<boolean>(false);

export const useFontLoaded = () => {
	return useContext(FontLoadedContext);
};

export function FontLoadedProvider({children}: {children: React.ReactNode}) {
	const [fontsLoaded, setFontsLoaded] = useState(false);

	useEffect(() => {
		Promise.all([
			document.fonts.load('900 10pt "Big Shoulders Stencil Text"'),
			document.fonts.load('600 10pt "Big Shoulders Stencil Display"')
		]).then(() => setFontsLoaded(true));
	}, []);

	return (
		<FontLoadedContext.Provider value={fontsLoaded}>
			{fontsLoaded ? children : <LoadingPage />}
		</FontLoadedContext.Provider>
	);
};
