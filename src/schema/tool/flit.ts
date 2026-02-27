import { z } from 'zod'
import type { UnknownKeyPolicy } from '../../types'

/**
 * Create a Zod schema for the [tool.flit] table.
 * @see [Flit configuration reference](https://flit.pypa.io/en/stable/pyproject_toml.html)
 */
export function createFlitSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	const moduleBase = z.object({
		name: z.string().optional(),
	})
	const moduleSchema =
		unknownKeyPolicy === 'error'
			? moduleBase.strict()
			: unknownKeyPolicy === 'strip'
				? moduleBase
				: moduleBase.loose()

	const sdistBase = z.object({
		exclude: z.array(z.string()).optional(),
		include: z.array(z.string()).optional(),
	})
	const sdistSchema =
		unknownKeyPolicy === 'error'
			? sdistBase.strict()
			: unknownKeyPolicy === 'strip'
				? sdistBase
				: sdistBase.loose()

	const base = z.object({
		module: moduleSchema.optional(),
		sdist: sdistSchema.optional(),
	})
	const object =
		unknownKeyPolicy === 'error'
			? base.strict()
			: unknownKeyPolicy === 'strip'
				? base
				: base.loose()
	return object
}
