interface ImportMetaEnv {
	readonly NODE_ENV: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
	// readonly env: { // Record<string, string>;
	// 	[key: string]: string,
	// }
}
