import { z } from 'zod'
import type { UnknownKeys } from '../../types'

/**
 * Create a Zod schema for the [tool.black] table.
 * @see [Black configuration reference](https://black.readthedocs.io/en/stable/usage_and_configuration/the_basics.html#configuration-via-a-file)
 */
export function createBlackSchema(unknownKeys: UnknownKeys) {
	const base = z.object({
		'extend-exclude': z.string().optional(),
		'force-exclude': z.string().optional(),
		include: z.string().optional(),
		'line-length': z.number().optional(),
		preview: z.boolean().optional(),
		'target-version': z.array(z.string()).optional(),
	})
	const object =
		unknownKeys === 'error' ? base.strict() : unknownKeys === 'strip' ? base : base.loose()
	return object.transform(
		({
			'extend-exclude': extendExclude,
			'force-exclude': forceExclude,
			'line-length': lineLength,
			'target-version': targetVersion,
			...rest
		}) => ({
			...rest,
			extendExclude,
			forceExclude,
			lineLength,
			targetVersion,
		}),
	)
}
