import { eslintConfig } from '@kitschpatrol/eslint-config'

export default eslintConfig(
	{
		ignores: ['test/fixtures/*'],
		type: 'lib',
	},
	{
		files: ['readme.md/*.ts'],
		rules: {
			// Readme examples import the package itself, which only resolves after a build
			'import/no-unresolved': ['error', { ignore: ['^read-pyproject$'] }],
		},
	},
)
