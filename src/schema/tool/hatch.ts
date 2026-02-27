import { z } from 'zod'
import type { UnknownKeyPolicy } from '../../types'

/**
 * Create a Zod schema for the [tool.hatch] table.
 * @see [Hatch configuration reference](https://hatch.pypa.io/latest/config/metadata/)
 */
export function createHatchSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	// Hatch build/version have many more options than we model (hooks, artifacts, sources, etc.),
	// so always allow unknown keys.
	const buildBase = z.object({ targets: z.object({}).loose().optional() })
	const buildSchema = unknownKeyPolicy === 'strip' ? buildBase : buildBase.loose()

	const versionBase = z.object({ path: z.string().optional(), source: z.string().optional() })
	const versionSchema = unknownKeyPolicy === 'strip' ? versionBase : versionBase.loose()

	const base = z.object({
		build: buildSchema.optional(),
		envs: z.record(z.string(), z.unknown()).optional(),
		metadata: z.object({}).loose().optional(),
		version: versionSchema.optional(),
	})
	const object =
		unknownKeyPolicy === 'error'
			? base.strict()
			: unknownKeyPolicy === 'strip'
				? base
				: base.loose()
	return object
}
