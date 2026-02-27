import { z } from 'zod'
import type { UnknownKeyPolicy } from '../../types'

/**
 * Create a Zod schema for the [tool.uv] table.
 * @see [uv configuration reference](https://docs.astral.sh/uv/reference/settings/)
 */
export function createUvSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	const base = z.object({
		'build-backend': z.object({}).loose().optional(),
		'build-constraint-dependencies': z.array(z.string()).optional(),
		conflicts: z.array(z.unknown()).optional(),
		'constraint-dependencies': z.array(z.string()).optional(),
		'dependency-metadata': z.array(z.object({}).loose()).optional(),
		'dev-dependencies': z.array(z.string()).optional(),
		'extra-build-dependencies': z.record(z.string(), z.array(z.unknown())).optional(),
		'extra-index-url': z.union([z.string(), z.array(z.string())]).optional(),
		'find-links': z.array(z.string()).optional(),
		index: z
			.array(z.object({ name: z.string().optional(), url: z.string().optional() }).loose())
			.optional(),
		'index-url': z.string().optional(),
		managed: z.boolean().optional(),
		'no-build-isolation-package': z.array(z.string()).optional(),
		'override-dependencies': z.array(z.string()).optional(),
		package: z.boolean().optional(),
		'python-downloads': z.string().optional(),
		'python-preference': z.string().optional(),
		'required-environments': z.array(z.string()).optional(),
		sources: z.record(z.string(), z.unknown()).optional(),
		workspace: z.object({}).loose().optional(),
	})
	const object =
		unknownKeyPolicy === 'error'
			? base.strict()
			: unknownKeyPolicy === 'strip'
				? base
				: base.loose()
	return object
}
