import { z } from 'zod'
import type { UnknownKeys } from '../../types'

/**
 * Create a Zod schema for the [tool.distutils] table.
 * @see [Distutils configuration reference](https://docs.python.org/3/distutils/configfile.html)
 */
export function createDistutilsSchema(unknownKeys: UnknownKeys) {
	const bdistWheelSchema = z
		.object({
			// eslint-disable-next-line ts/naming-convention
			python_tag: z.string().optional(),
			universal: z.union([z.boolean(), z.number()]).optional(),
		})
		.loose()
		.transform(({ python_tag: pythonTag, ...rest }) => ({
			...rest,
			pythonTag,
		}))

	const base = z.object({
		// eslint-disable-next-line ts/naming-convention
		bdist_wheel: bdistWheelSchema.optional(),
		sdist: z.object({}).loose().optional(),
	})
	const object =
		unknownKeys === 'error' ? base.strict() : unknownKeys === 'strip' ? base : base.loose()
	return object.transform(({ bdist_wheel: bdistWheel, ...rest }) => ({
		...rest,
		bdistWheel,
	}))
}
