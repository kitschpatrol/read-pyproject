import { z } from 'zod'
import type { UnknownKeyPolicy } from '../../types'

/**
 * Create a Zod schema for the [tool.jupyter-releaser] table.
 * @see [Jupyter Releaser reference](https://jupyter-releaser.readthedocs.io/en/latest/)
 */
export function createJupyterReleaserSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	const hooksBase = z.object({
		'before-build-npm': z.array(z.string()).optional(),
		'before-build-python': z.array(z.string()).optional(),
	})
	const hooksObject =
		unknownKeyPolicy === 'error'
			? hooksBase.strict()
			: unknownKeyPolicy === 'strip'
				? hooksBase
				: hooksBase.loose()
	const hooksSchema = hooksObject.transform(
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
		unknownKeyPolicy === 'error'
			? base.strict()
			: unknownKeyPolicy === 'strip'
				? base
				: base.loose()
	return object
}
