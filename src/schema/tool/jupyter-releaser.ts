import { z } from 'zod'
import type { UnknownKeys } from '../../types'

/**
 * Create a Zod schema for the [tool.jupyter-releaser] table.
 * @see [Jupyter Releaser reference](https://jupyter-releaser.readthedocs.io/en/latest/)
 */
export function createJupyterReleaserSchema(unknownKeys: UnknownKeys) {
	const hooksSchema = z
		.object({
			'before-build-npm': z.array(z.string()).optional(),
			'before-build-python': z.array(z.string()).optional(),
		})
		.loose()
		.transform(
			({
				'before-build-npm': beforeBuildNpm,
				'before-build-python': beforeBuildPython,
				...rest
			}) => ({
				...rest,
				beforeBuildNpm,
				beforeBuildPython,
			}),
		)

	const optionsSchema = z.object({}).loose()

	const base = z.object({
		hooks: hooksSchema.optional(),
		options: optionsSchema.optional(),
	})
	const object =
		unknownKeys === 'error' ? base.strict() : unknownKeys === 'strip' ? base : base.loose()
	return object
}
