import { z } from 'zod'
import type { UnknownKeyPolicy } from '../../types'

/**
 * Create a Zod schema for the [tool.hatch] table.
 * @see [Hatch configuration reference](https://hatch.pypa.io/latest/config/metadata/)
 */
export function createHatchSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	const base = z.object({
		build: z
			.object({ targets: z.object({}).loose().optional() })
			.loose()
			.optional(),
		envs: z.record(z.string(), z.unknown()).optional(),
		metadata: z.object({}).loose().optional(),
		version: z
			.object({ path: z.string().optional(), source: z.string().optional() })
			.loose()
			.optional(),
	})
	const object =
		unknownKeyPolicy === 'error'
			? base.strict()
			: unknownKeyPolicy === 'strip'
				? base
				: base.loose()
	return object
}
