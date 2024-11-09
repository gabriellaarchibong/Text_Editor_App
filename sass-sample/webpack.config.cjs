const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const Dotenv = require('dotenv-webpack');

// const ManifestPlugin = require('./manifest-webpack-plugin');
// const buildOutputMapFilePath = path.resolve(__dirname, 'build-output-map.json');

const environment = process.env.NODE_ENV || 'staging';
console.log({ environment });


const CSSConfig = {
	name: 'CSSConfig',
	entry: {
		styles: './styles.scss',
		page2: './page2.scss',
	},
	output: {
		path: path.resolve(__dirname, 'bundles'),
		filename: '[name].bundle.js',
	},
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: (info) => [
					{
						loader: 'file-loader',
						options: {
							name: '[name].bundle.css',
						},
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: false,
						},
					},
				]
			}
		]
	},
	plugins: [
		// new ManifestPlugin({
		// 	filePath: buildOutputMapFilePath,
		// 	types: ['css'],
		// 	skip: (filename) => filename.endsWith('-critical.css') || filename.endsWith('single-account.css'),
		// }),
	],
};

const JSConfig = {
	name: 'JSConfig',
	entry: {
		index: './index.tsx',
	},
	output: {
		path: path.resolve(__dirname, 'bundles'),
		filename: '[name].bundle.js',
	},
	module: {
		rules: [
			{
				test: /\.(j|t)sx?$/,
				// Compile node_modules too, but exclude core-js && babel
				exclude: /(core-js|babel)/,
				use: {
					loader: 'babel-loader',
				},
			},
		],
	},
	resolveLoader: {
		modules: [
			path.join(__dirname, 'node_modules'),
		],
	},

	resolve: {
		modules: [
			path.join(__dirname, 'node_modules'),
		],
		alias: {
			'@': path.resolve(__dirname, './'),
		},
	},
	// watchOptions: {
	// 	ignored: ['**/build-output-map.json'],
	// },
	plugins: [
		// new ManifestPlugin({
		// 	filePath: buildOutputMapFilePath,
		// 	types: ['js', 'json'],
		// }),
		new Dotenv({
			// path: './some.other.env', // load this now instead of the ones in '.env'
			// safe: true, // load '.env.example' to verify the '.env' variables are all set. Can also be a string to a different file.
			allowEmptyValues: true, // allow empty variables (e.g. `FOO=`) (treat it as empty string, rather than missing)
			systemvars: true, // load all the predefined 'process.env' variables which will trump anything local per dotenv specs.
			// silent: true, // hide any errors
			defaults: false, // load '.env.defaults' as the default values if empty.
			prefix: 'import.meta.env.', // 'process.env.' // reference your env variables as 'import.meta.env.ENV_VAR'.
		}),
		// Discuss tabs vs. spaces
	],
	mode: environment === 'production' ? 'production' : 'development',
	optimization: {
		usedExports: true,
		minimize: environment === 'production',
		minimizer: [
			new TerserPlugin(),
		],
	},
	devtool: environment === 'production' ? 'hidden-source-map' : 'eval-source-map',
};

module.exports = [JSConfig, CSSConfig];
