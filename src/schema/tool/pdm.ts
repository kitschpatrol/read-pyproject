import { z } from 'zod'

/**
 * Create a Zod schema for the [tool.pdm] table.
 */
export function createPdmSchema(strict: boolean) {
	const base = z.object({
		build: z.object({}).loose().optional(),
		'dev-dependencies': z.record(z.string(), z.array(z.string())).optional(),
		distribution: z.boolean().optional(),
		source: z
			.array(z.object({ name: z.string().optional(), url: z.string().optional() }).loose())
			.optional(),
	})
	const object = strict ? base.strict() : base.loose()
	return object.transform(({ 'dev-dependencies': devDependencies, ...rest }) => ({
		...rest,
		devDependencies,
	}))
}
