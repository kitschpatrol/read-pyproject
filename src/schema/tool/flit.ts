import { z } from 'zod'
import type { UnknownKeyPolicy } from '../../types'

/**
 * Create a Zod schema for the [tool.flit] table.
 * @see [Flit configuration reference](https://flit.pypa.io/en/stable/pyproject_toml.html)
 */
export function createFlitSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	const moduleSchema = z
		.object({
			name: z.string().optional(),
		})
		.loose()

	const sdistSchema = z
		.object({
			exclude: z.array(z.string()).optional(),
			include: z.array(z.string()).optional(),
		})
		.loose()

	const base = z.object({
		module: moduleSchema.optional(),
		sdist: sdistSchema.optional(),
	})
	const object =
		unknownKeyPolicy === 'error' ? base.strict() : unknownKeyPolicy === 'strip' ? base : base.loose()
	return object
}
