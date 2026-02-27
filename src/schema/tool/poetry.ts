import { z } from 'zod'
import type { UnknownKeys } from '../../types'

/**
 * Create a Zod schema for the [tool.poetry] table.
 * @see [Poetry pyproject.toml reference](https://python-poetry.org/docs/pyproject/)
 */
export function createPoetrySchema(unknownKeys: UnknownKeys) {
	const base = z.object({
		authors: z.array(z.string()).optional(),
		classifiers: z.array(z.string()).optional(),
		dependencies: z.record(z.string(), z.unknown()).optional(),
		description: z.string().optional(),
		'dev-dependencies': z.record(z.string(), z.unknown()).optional(),
		documentation: z.string().optional(),
		exclude: z.union([z.string(), z.array(z.string())]).optional(),
		extras: z.record(z.string(), z.array(z.string())).optional(),
		group: z.record(z.string(), z.unknown()).optional(),
		homepage: z.string().optional(),
		include: z.union([z.string(), z.array(z.union([z.string(), z.object({}).loose()]))]).optional(),
		keywords: z.array(z.string()).optional(),
		license: z.string().optional(),
		maintainers: z.array(z.string()).optional(),
		name: z.string().optional(),
		packages: z.array(z.object({ include: z.string() }).loose()).optional(),
		plugins: z.record(z.string(), z.unknown()).optional(),
		readme: z.union([z.string(), z.array(z.string())]).optional(),
		repository: z.string().optional(),
		scripts: z.record(z.string(), z.string()).optional(),
		source: z.array(z.object({ name: z.string(), url: z.string() }).loose()).optional(),
		urls: z.record(z.string(), z.string()).optional(),
		version: z.string().optional(),
	})
	const object =
		unknownKeys === 'error' ? base.strict() : unknownKeys === 'strip' ? base : base.loose()
	return object.transform(({ 'dev-dependencies': devDependencies, ...rest }) => ({
		...rest,
		devDependencies,
	}))
}
