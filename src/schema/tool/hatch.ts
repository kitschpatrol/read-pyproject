import { z } from 'zod'

/**
 * Create a Zod schema for the [tool.hatch] table.
 */
export function createHatchSchema(strict: boolean) {
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
	const object = strict ? base.strict() : base.loose()
	return object
}
