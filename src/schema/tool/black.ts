import { z } from 'zod'
import type { UnknownKeyPolicy } from '../../types'

/**
 * Create a Zod schema for the [tool.black] table.
 * @see [Black configuration reference](https://black.readthedocs.io/en/stable/usage_and_configuration/the_basics.html#configuration-via-a-file)
 */
export function createBlackSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	const booleanOrString = z.union([z.boolean(), z.string()])

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
		'python-version': z.union([z.string(), z.array(z.string())]).optional(),
		quiet: z.boolean().optional(),
		'required-version': z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		required_version: z.string().optional(),
		'skip-magic-trailing-comma': z.boolean().optional(),
		'skip-numeric-underscore-normalization': booleanOrString.optional(),
		'skip-string-normalization': booleanOrString.optional(),
		// eslint-disable-next-line ts/naming-convention
		skip_string_normalization: booleanOrString.optional(),
		'target-version': z.array(z.string()).optional(),
		// eslint-disable-next-line ts/naming-convention
		target_version: z.array(z.string()).optional(),
		workers: z.number().optional(),
	})
	const object =
		unknownKeyPolicy === 'error'
			? base.strict()
			: unknownKeyPolicy === 'strip'
				? base
				: base.loose()
	return object.transform(
		({
			'line-length': lineLength,
			line_length: lineLengthSnake,
			'required-version': requiredVersion,
			required_version: requiredVersionSnake,
			'skip-string-normalization': skipStringNormalization,
			skip_string_normalization: skipStringNormalizationSnake,
			'target-version': targetVersion,
			target_version: targetVersionSnake,
			...rest
		}) => ({
			...rest,
			'line-length': lineLength ?? lineLengthSnake,
			'required-version': requiredVersion ?? requiredVersionSnake,
			'skip-string-normalization': skipStringNormalization ?? skipStringNormalizationSnake,
			'target-version': targetVersion ?? targetVersionSnake,
		}),
	)
}
