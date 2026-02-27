import { z } from 'zod'

const buildSystemRawShape = {
	'backend-path': z.array(z.string()).optional(),
	'build-backend': z.string().optional(),
	requires: z.array(z.string()).optional(),
}

/**
 * Create a Zod schema for the [build-system] table.
 */
export function createBuildSystemSchema(strict: boolean) {
	const base = z.object(buildSystemRawShape)
	const object = strict ? base.strict() : base.loose()
	return object.transform(
		({ 'backend-path': backendPath, 'build-backend': buildBackend, ...rest }) => ({
			...rest,
			backendPath,
			buildBackend,
		}),
	)
}
