import { z } from 'zod'

/**
 * Create a Zod schema for the [tool.poetry] table.
 */
export function createPoetrySchema(strict: boolean) {
	const base = z.object({
		authors: z.array(z.string()).optional(),
		dependencies: z.record(z.string(), z.unknown()).optional(),
		description: z.string().optional(),
		'dev-dependencies': z.record(z.string(), z.unknown()).optional(),
		extras: z.record(z.string(), z.array(z.string())).optional(),
		group: z.record(z.string(), z.unknown()).optional(),
		license: z.string().optional(),
		name: z.string().optional(),
		packages: z.array(z.object({ include: z.string() }).loose()).optional(),
		plugins: z.record(z.string(), z.unknown()).optional(),
		readme: z.union([z.string(), z.array(z.string())]).optional(),
		scripts: z.record(z.string(), z.string()).optional(),
		source: z.array(z.object({ name: z.string(), url: z.string() }).loose()).optional(),
		urls: z.record(z.string(), z.string()).optional(),
		version: z.string().optional(),
	})
	const object = strict ? base.strict() : base.loose()
	return object.transform(({ 'dev-dependencies': devDependencies, ...rest }) => ({
		...rest,
		devDependencies,
	}))
}
