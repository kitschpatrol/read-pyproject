import { z } from 'zod'
import type { UnknownKeys } from '../../types'

/**
 * Create a Zod schema for the [tool.pdm] table.
 * @see [PDM configuration reference](https://pdm-project.org/en/latest/reference/configuration/)
 */
export function createPdmSchema(unknownKeys: UnknownKeys) {
	const base = z.object({
		build: z.object({}).loose().optional(),
		'dev-dependencies': z.record(z.string(), z.array(z.string())).optional(),
		distribution: z.boolean().optional(),
		source: z
			.array(z.object({ name: z.string().optional(), url: z.string().optional() }).loose())
			.optional(),
	})
	const object =
		unknownKeys === 'error' ? base.strict() : unknownKeys === 'strip' ? base : base.loose()
	return object.transform(({ 'dev-dependencies': devDependencies, ...rest }) => ({
		...rest,
		devDependencies,
	}))
}
