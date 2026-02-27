import { defineConfig } from 'tsdown'

export default defineConfig([
	{
		attw: {
			profile: 'esm-only',
		},
		dts: true,
		fixedExtension: false,
		publint: true,
		tsconfig: 'tsconfig.build.json',
	},
])
