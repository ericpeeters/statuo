module.exports = {
	plugins: ["@babel/plugin-proposal-class-properties"],
	presets: [
		[
			"@babel/preset-env",
			{
				targets: {
					node: "current"
				}
			}
		]
	],
	env: {
		es5: {
			presets: [["@babel/preset-env"]]
		},
		es6: {
			presets: [
				[
					"@babel/preset-env",
					{
						targets: {
							esmodules: true
						}
						, modules: false

					}
				]
			]
		}
	}
};
