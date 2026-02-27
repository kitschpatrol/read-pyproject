import { z } from 'zod'

/**
 * Create a Zod schema for the [tool.ruff] table.
 * @see [Ruff configuration reference](https://docs.astral.sh/ruff/configuration/)
 * @see [Ruff settings](https://docs.astral.sh/ruff/settings/)
 */
export function createRuffSchema(strict: boolean) {
	const lintSchema = z
		.object({
			'extend-select': z.array(z.string()).optional(),
			fixable: z.array(z.string()).optional(),
			ignore: z.array(z.string()).optional(),
			isort: z.object({}).loose().optional(),
			'per-file-ignores': z.record(z.string(), z.array(z.string())).optional(),
			select: z.array(z.string()).optional(),
		})
		.loose()
		.transform(
			({ 'extend-select': extendSelect, 'per-file-ignores': perFileIgnores, ...rest }) => ({
				...rest,
				extendSelect,
				perFileIgnores,
			}),
		)

	const formatSchema = z
		.object({
			'docstring-code-format': z.boolean().optional(),
			'indent-style': z.string().optional(),
			'line-ending': z.string().optional(),
			'quote-style': z.string().optional(),
		})
		.loose()
		.transform(
			({
				'docstring-code-format': docstringCodeFormat,
				'indent-style': indentStyle,
				'line-ending': lineEnding,
				'quote-style': quoteStyle,
				...rest
			}) => ({
				...rest,
				docstringCodeFormat,
				indentStyle,
				lineEnding,
				quoteStyle,
			}),
		)

	const base = z.object({
		format: formatSchema.optional(),
		'line-length': z.number().optional(),
		lint: lintSchema.optional(),
		src: z.array(z.string()).optional(),
		'target-version': z.string().optional(),
	})
	const object = strict ? base.strict() : base.loose()
	return object.transform(
		({ 'line-length': lineLength, 'target-version': targetVersion, ...rest }) => ({
			...rest,
			lineLength,
			targetVersion,
		}),
	)
}
