import { z } from 'zod'

/**
 * Create a Zod schema for the [tool.setuptools] table.
 * @see [Setuptools pyproject.toml reference](https://setuptools.pypa.io/en/latest/userguide/pyproject_config.html)
 */
export function createSetuptoolsSchema(strict: boolean) {
	const base = z.object({
		dynamic: z.object({}).loose().optional(),
		'package-data': z.record(z.string(), z.array(z.string())).optional(),
		'package-dir': z.record(z.string(), z.string()).optional(),
		packages: z
			.union([z.array(z.string()), z.object({ find: z.object({}).loose().optional() }).loose()])
			.optional(),
		'py-modules': z.array(z.string()).optional(),
	})
	const object = strict ? base.strict() : base.loose()
	return object.transform(
		({
			'package-data': packageData,
			'package-dir': packageDirectory,
			'py-modules': pyModules,
			...rest
		}) => ({
			...rest,
			packageData,
			packageDirectory,
			pyModules,
		}),
	)
}
