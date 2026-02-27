import { z } from 'zod'
import type { UnknownKeys } from '../../types'

/**
 * Create a Zod schema for the [tool.autopep8] table.
 * @see [autopep8 configuration reference](https://pypi.org/project/autopep8/)
 */
export function createAutopep8Schema(unknownKeys: UnknownKeys) {
	const base = z.object({
		aggressive: z.number().optional(),
		ignore: z.union([z.string(), z.array(z.string())]).optional(),
		// eslint-disable-next-line ts/naming-convention
		max_line_length: z.number().optional(),
	})
	const object =
		unknownKeys === 'error' ? base.strict() : unknownKeys === 'strip' ? base : base.loose()
	return object.transform(({ max_line_length: maxLineLength, ...rest }) => ({
		...rest,
		maxLineLength,
	}))
}
