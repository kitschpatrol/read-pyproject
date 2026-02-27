import { z } from 'zod'
import type { UnknownKeyPolicy } from '../../types'

/**
 * Create a Zod schema for the [tool.pixi] table.
 * @see [Pixi configuration reference](https://pixi.sh/latest/reference/pixi_configuration/)
 */
export function createPixiSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	const base = z.object({
		dependencies: z.record(z.string(), z.unknown()).optional(),
		environments: z.record(z.string(), z.unknown()).optional(),
		feature: z.record(z.string(), z.unknown()).optional(),
		'pypi-dependencies': z.record(z.string(), z.unknown()).optional(),
		tasks: z.record(z.string(), z.unknown()).optional(),
		workspace: z.object({}).loose().optional(),
	})
	// Always loose — pixi has many dynamic sub-sections (feature.*, environments, etc.)
	const object = unknownKeyPolicy === 'strip' ? base : base.loose()
	return object
}
