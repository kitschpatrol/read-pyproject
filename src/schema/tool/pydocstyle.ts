import { z } from 'zod'
import type { UnknownKeyPolicy } from '../../types'

/**
 * Create a Zod schema for the [tool.pydocstyle] table.
 * @see [pydocstyle configuration reference](https://www.pydocstyle.org/en/stable/usage.html#configuration-files)
 */
export function createPydocstyleSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	const stringOrArray = z.union([z.string(), z.array(z.string())])

	const base = z.object({
		// eslint-disable-next-line ts/naming-convention
		add_ignore: stringOrArray.optional(),
		// eslint-disable-next-line ts/naming-convention
		add_select: stringOrArray.optional(),
		convention: z.string().optional(),
		ignore: stringOrArray.optional(),
		// eslint-disable-next-line ts/naming-convention
		ignore_decorators: z.string().optional(),
		match: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		match_dir: z.string().optional(),
		select: stringOrArray.optional(),
	})
	const object =
		unknownKeyPolicy === 'error' ? base.strict() : unknownKeyPolicy === 'strip' ? base : base.loose()
	return object.transform(
		({
			add_ignore: addIgnore,
			add_select: addSelect,
			ignore_decorators: ignoreDecorators,
			// eslint-disable-next-line unicorn/prevent-abbreviations
			match_dir: matchDir,
			...rest
		}) => ({
			...rest,
			addIgnore,
			addSelect,
			ignoreDecorators,
			matchDir,
		}),
	)
}
