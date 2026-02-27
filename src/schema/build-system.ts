import { z } from 'zod'
import type { UnknownKeys } from '../types'

const buildSystemRawShape = {
	'backend-path': z.array(z.string()).optional(),
	'build-backend': z.string().optional(),
	requires: z.array(z.string()).optional(),
}

/**
 * Create a Zod schema for the [build-system] table.
 */
export function createBuildSystemSchema(unknownKeys: UnknownKeys) {
	const base = z.object(buildSystemRawShape)
	const object =
		unknownKeys === 'error' ? base.strict() : unknownKeys === 'strip' ? base : base.loose()
	return object.transform(
		({ 'backend-path': backendPath, 'build-backend': buildBackend, ...rest }) => ({
			...rest,
			backendPath,
			buildBackend,
		}),
	)
}
