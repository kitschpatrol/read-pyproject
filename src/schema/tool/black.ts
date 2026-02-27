import { z } from 'zod'
import type { UnknownKeys } from '../../types'

/**
 * Create a Zod schema for the [tool.black] table.
 * @see [Black configuration reference](https://black.readthedocs.io/en/stable/usage_and_configuration/the_basics.html#configuration-via-a-file)
 */
export function createBlackSchema(unknownKeys: UnknownKeys) {
	const base = z.object({
		color: z.boolean().optional(),
		exclude: z.string().optional(),
		'extend-exclude': z.string().optional(),
		'force-exclude': z.string().optional(),
		include: z.string().optional(),
		'line-length': z.number().optional(),
		// eslint-disable-next-line ts/naming-convention
		line_length: z.number().optional(),
		preview: z.boolean().optional(),
		quiet: z.boolean().optional(),
		'required-version': z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		required_version: z.string().optional(),
		'skip-magic-trailing-comma': z.boolean().optional(),
		'skip-string-normalization': z.union([z.boolean(), z.string()]).optional(),
		// eslint-disable-next-line ts/naming-convention
		skip_string_normalization: z.union([z.boolean(), z.string()]).optional(),
		'target-version': z.array(z.string()).optional(),
		workers: z.number().optional(),
	})
	const object =
		unknownKeys === 'error' ? base.strict() : unknownKeys === 'strip' ? base : base.loose()
	return object.transform(
		({
			'extend-exclude': extendExclude,
			'force-exclude': forceExclude,
			'line-length': lineLength,
			line_length: lineLengthSnake,
			'required-version': requiredVersion,
			required_version: requiredVersionSnake,
			'skip-magic-trailing-comma': skipMagicTrailingComma,
			'skip-string-normalization': skipStringNormalization,
			skip_string_normalization: skipStringNormalizationSnake,
			'target-version': targetVersion,
			...rest
		}) => ({
			...rest,
			extendExclude,
			forceExclude,
			lineLength: lineLength ?? lineLengthSnake,
			requiredVersion: requiredVersion ?? requiredVersionSnake,
			skipMagicTrailingComma,
			skipStringNormalization: skipStringNormalization ?? skipStringNormalizationSnake,
			targetVersion,
		}),
	)
}
