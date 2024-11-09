import type { FunctionComponent } from 'react';

import React from 'react';
import { createRoot } from 'react-dom/client';

type TProps = {
	title: string,
}

const App: FunctionComponent<TProps> = (props) => {
	console.log({env: import.meta.env.NODE_ENV});
	if (import.meta.env.NODE_ENV === 'production') return (
		<main className="red-title">
			<h1>Webpack + Sass Sample — {props.title}</h1>
		</main>
	);
	else return (
		<main className="red-title">
			<h1>Webpack + Sass Staging Sample — {props.title}</h1>
		</main>
	);
};

createRoot(document.body).render(<App title="My Title" />);
