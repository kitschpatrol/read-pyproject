import { z } from 'zod'

/**
 * Create a Zod schema for the [tool.black] table.
 */
export function createBlackSchema(strict: boolean) {
	const base = z.object({
		'extend-exclude': z.string().optional(),
		'force-exclude': z.string().optional(),
		include: z.string().optional(),
		'line-length': z.number().optional(),
		preview: z.boolean().optional(),
		'target-version': z.array(z.string()).optional(),
	})
	const object = strict ? base.strict() : base.loose()
	return object.transform(
		({
			'extend-exclude': extendExclude,
			'force-exclude': forceExclude,
			'line-length': lineLength,
			'target-version': targetVersion,
			...rest
		}) => ({
			...rest,
			extendExclude,
			forceExclude,
			lineLength,
			targetVersion,
		}),
	)
}
