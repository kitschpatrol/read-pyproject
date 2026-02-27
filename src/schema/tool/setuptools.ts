import { z } from 'zod'
import type { UnknownKeyPolicy } from '../../types'

/**
 * Create a Zod schema for the [tool.setuptools] table.
 * @see [Setuptools pyproject.toml reference](https://setuptools.pypa.io/en/latest/userguide/pyproject_config.html)
 */
export function createSetuptoolsSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	const base = z.object({
		dynamic: z.object({}).loose().optional(),
		'include-package-data': z.boolean().optional(),
		'package-data': z.record(z.string(), z.array(z.string())).optional(),
		'package-dir': z.record(z.string(), z.string()).optional(),
		packages: z
			.union([z.array(z.string()), z.object({ find: z.object({}).loose().optional() }).loose()])
			.optional(),
		platforms: z.array(z.string()).optional(),
		'py-modules': z.array(z.string()).optional(),
		'script-files': z.array(z.string()).optional(),
		'zip-safe': z.boolean().optional(),
	})
	const object =
		unknownKeyPolicy === 'error'
			? base.strict()
			: unknownKeyPolicy === 'strip'
				? base
				: base.loose()
	return object
}
