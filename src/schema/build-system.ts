import { z } from 'zod'
import type { UnknownKeyPolicy } from '../types'

const buildSystemRawShape = {
	'backend-path': z.array(z.string()).optional(),
	'build-backend': z.string().optional(),
	requires: z.array(z.string()).optional(),
}

/**
 * Create a Zod schema for the [build-system] table.
 */
export function createBuildSystemSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	const base = z.object(buildSystemRawShape)
	const object =
		unknownKeyPolicy === 'error'
			? base.strict()
			: unknownKeyPolicy === 'strip'
				? base
				: base.loose()
	return object.transform(
		({ 'backend-path': backendPath, 'build-backend': buildBackend, ...rest }) => ({
			...rest,
			backendPath,
			buildBackend,
		}),
	)
}
