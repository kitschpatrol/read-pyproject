import { z } from 'zod'

/**
 * Create a Zod schema for the [tool.uv] table.
 * @see [uv configuration reference](https://docs.astral.sh/uv/reference/settings/)
 */
export function createUvSchema(strict: boolean) {
	const base = z.object({
		'constraint-dependencies': z.array(z.string()).optional(),
		'dev-dependencies': z.array(z.string()).optional(),
		'extra-index-url': z.union([z.string(), z.array(z.string())]).optional(),
		'find-links': z.array(z.string()).optional(),
		index: z
			.array(z.object({ name: z.string().optional(), url: z.string().optional() }).loose())
			.optional(),
		'index-url': z.string().optional(),
		'override-dependencies': z.array(z.string()).optional(),
		sources: z.record(z.string(), z.unknown()).optional(),
	})
	const object = strict ? base.strict() : base.loose()
	return object.transform(
		({
			'constraint-dependencies': constraintDependencies,
			'dev-dependencies': devDependencies,
			'extra-index-url': extraIndexUrl,
			'find-links': findLinks,
			'index-url': indexUrl,
			'override-dependencies': overrideDependencies,
			...rest
		}) => ({
			...rest,
			constraintDependencies,
			devDependencies,
			extraIndexUrl,
			findLinks,
			indexUrl,
			overrideDependencies,
		}),
	)
}
