/* eslint-disable camelcase */

const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const LessPluginCleanCSS = require("less-plugin-clean-css");
const LessPluginAutoPrefix = require("less-plugin-autoprefix");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const autoprefixBrowsers = [
	"ie >= 11",
	"iOS >= 7",
	"Firefox >= 45",
	"Chrome >= 49",
	"Opera >= 38",
	"Safari >= 7",
	"Edge >= 13",
	"last 2 versions",
];

config = {
	optimization: {
		splitChunks: {
			cacheGroups: {
				styles: {
					name: "styles",
					test: /\.css$/,
					chunks: "all",
					enforce: true,
				},
			},
		},
	},

	entry: {
		app: ["./src/js/app.js", "./src/less/app.less"],
		content: ["./src/js/content.js"],
		"ga-legacy": ["./src/js/ga-legacy.js"],
		"ga-main": ["./src/js/ga-main.js"],
	},

	output: {
		path: path.join(__dirname, "dist"),
		filename: "js/[name].js",
		publicPath: "",
		chunkFilename: "[id].js",
	},

	devServer: {
		port: process.env.PORT || 8080,
		historyApiFallback: { index: "/" },
	},

	externals: {
		"react/addons": true,
		"react/lib/ExecutionEnvironment": true,
		"react/lib/ReactContext": true,
	},

	resolve: {
		extensions: [".webpack.js", ".web.js", ".js", ".jsx"],
		alias: {
			modernizr$: path.resolve(__dirname, ".modernizrrc"),
		},
	},

	module: {
		rules: [
			// {
			// 	enforce: "pre",
			// 	test: /\.(js|jsx)$/,
			// 	exclude: /node_modules/,
			// 	loader: "eslint-loader"
			// },
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				loader: "babel-loader",
				options: {
					presets: ["@babel/preset-env", "@babel/preset-react"],
					plugins: ["@babel/plugin-proposal-class-properties"],
				},
			},
			{
				test: /\.less$/,
				exclude: /node_modules/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							publicPath: "../",
						},
					},
					"css-loader",
					{
						loader: "less-loader",
						options: {
							plugins: [
								new LessPluginAutoPrefix({ browsers: autoprefixBrowsers }),
								new LessPluginCleanCSS({ advanced: true }),
							],
						},
					},
				],
			},
			{
				test: /images.+\.ico$/,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "images/[path][name].[ext]",
							context: "./src/images",
							esModule: false,
						},
					},
				],
			},
			{
				test: /images.+\.(png|jpg|jpeg|gif|svg)$/,
				use: [
					// To inline images if small enough:
					// "url-loader?name=images/[path][name].[ext]&context=./src/images&limit=1000",
					{
						loader: "url-loader",
						options: {
							name: "images/[path][name].[ext]",
							context: "./src/images",
							limit: 1000,
							esModule: false,
						},
					},
					// To always have external images:
					// "file-loader?name=images/[path][name].[ext]&context=./src/images",
					{
						loader: "image-webpack-loader",
						options: {
							mozjpeg: {
								quality: 75,
							},
							pngquant: {
								quality: [0.75, 0.9],
								speed: 3, // Speed/quality trade-off from 1 (brute-force) to 10 (fastest). The default is 3. Speed 10 has 5% lower quality, but is 8 times faster than the default.
							},
							svgo: {
								plugins: [
									{
										removeTitle: true,
									},
								],
							},
						},
					},
				],
			},
			{
				test: /fonts.+\.(eot|woff|ttf|svg)$/,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "css/fonts/[name].[ext]",
						},
					},
				],
			},
			{
				test: /\.modernizrrc.js$/,
				use: ["modernizr-loader"],
			},
			{
				test: /\.modernizrrc(\.json)?$/,
				use: ["modernizr-loader", "json-loader"],
			},
		],
	},
};

module.exports = (env, argv) => {

	const isProd = argv.mode === "production";

	const METADATA = {
		title: "Security Planner",
		url: "securityplanner.org",
		urlBeauty: "securityplanner.org",
		googleAnalyticsID: isProd ? "UA-104999308-1" : "",
		language: "en",
	};

	const prodPluginsBefore = [
		new CleanWebpackPlugin(["dist"], {
			root: __dirname,
			verbose: true,
			dry: false,
			exclude: [],
		}),
	];

	const basePlugins = [
		new webpack.LoaderOptionsPlugin({
			options: {
				context: __dirname,
			},
		}),
		new webpack.DefinePlugin({
			__SPACE_ID__ : JSON.stringify(isProd ? "ta4xc5av592v" : "dyix407qb7va"),
			__DELIVERY_KEY__ : JSON.stringify(isProd ? "c2a21ef1c90c40593f8a39fbf986c2cd3cff339fac21a4e04f66e3d7011abe1d" : "bRLrb2Uh9Amd4zUc86bbQXvW9ZqzPhkz6oCVq2WDlA4"),
			__PREVIEW_KEY__ : JSON.stringify(isProd ? "5d9f6f7bfc0f438d5bd9e24c699b7bb84631aa1894b26d1c07a5b43ca225f19e" : "dIuAqc2YhhwTIlkviZ7aJYnkqQwnqOqTm33ue2Nidt0")
		}),
		new HtmlWebpackPlugin({
			title: METADATA.title,
			url: METADATA.url,
			urlBeauty: METADATA.urlBeauty,
			googleAnalyticsID: METADATA.googleAnalyticsID,
			language: METADATA.language,
			template: "./src/html/index.html",
			filename: "index.html",
			inject: false,
			chunks: ["app", "content", "ga-main"],
		}),
		new HtmlWebpackPlugin({
			title: METADATA.title,
			url: METADATA.url,
			urlBeauty: METADATA.urlBeauty,
			googleAnalyticsID: METADATA.googleAnalyticsID,
			language: METADATA.language,
			template: "./src/html/legacy.html",
			filename: "legacy.html",
			inject: false,
			chunks: ["ga-legacy"],
		}),
		new CopyWebpackPlugin([
			{ from: "./src/html/landing.html", to: "./landing.html" },
			{ from: "./src/html/landing-image.png", to: "./landing-image.png" },
			{ from: "./src/html/error.html", to: "./error.html" },
		]),
		new MiniCssExtractPlugin({
			filename: "css/[name].css",
		}),
	];

	const plugins = []
		.concat(basePlugins)
		.concat( isProd ? prodPluginsBefore : []);

	config.plugins = plugins;

	config.devtool = isProd ? "" : "source-map";

	return config;
};
