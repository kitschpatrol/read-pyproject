import { z } from 'zod'
import type { UnknownKeyPolicy } from '../../types'

/**
 * Create a Zod schema for the [tool.pdm] table.
 * @see [PDM configuration reference](https://pdm-project.org/en/latest/reference/configuration/)
 */
export function createPdmSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	const sourceItemBase = z.object({
		name: z.string().optional(),
		url: z.string().optional(),
	})
	const sourceItemSchema =
		unknownKeyPolicy === 'error'
			? sourceItemBase.strict()
			: unknownKeyPolicy === 'strip'
				? sourceItemBase
				: sourceItemBase.loose()

	const base = z.object({
		build: z.object({}).loose().optional(),
		'dev-dependencies': z.record(z.string(), z.array(z.string())).optional(),
		distribution: z.boolean().optional(),
		source: z.array(sourceItemSchema).optional(),
	})
	const object =
		unknownKeyPolicy === 'error'
			? base.strict()
			: unknownKeyPolicy === 'strip'
				? base
				: base.loose()
	return object
}
