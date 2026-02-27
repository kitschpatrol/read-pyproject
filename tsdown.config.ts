import { defineConfig } from 'tsdown'

export default defineConfig([
	{
		attw: {
			profile: 'esm-only',
		},
		fixedExtension: false,
		minify: true,
		platform: 'neutral',
		publint: true,
		tsconfig: 'tsconfig.build.json',
	},
])
