import { z } from 'zod'
import type { UnknownKeys } from '../../types'

/**
 * Create a Zod schema for the [tool.check-wheel-contents] table.
 * @see [check-wheel-contents reference](https://github.com/jwodder/check-wheel-contents)
 */
export function createCheckWheelContentsSchema(unknownKeys: UnknownKeys) {
	const base = z.object({
		ignore: z.array(z.string()).optional(),
		package: z.string().optional(),
		'src-dir': z.string().optional(),
		toplevel: z.union([z.string(), z.array(z.string())]).optional(),
	})
	const object =
		unknownKeys === 'error' ? base.strict() : unknownKeys === 'strip' ? base : base.loose()
	return object.transform(({ 'src-dir': srcDirectory, ...rest }) => ({
		...rest,
		srcDirectory,
	}))
}
