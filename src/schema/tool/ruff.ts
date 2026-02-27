import { z } from 'zod'
import type { UnknownKeys } from '../../types'

/**
 * Create a Zod schema for the [tool.ruff] table.
 * @see [Ruff configuration reference](https://docs.astral.sh/ruff/configuration/)
 * @see [Ruff settings](https://docs.astral.sh/ruff/settings/)
 */
export function createRuffSchema(unknownKeys: UnknownKeys) {
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
		exclude: z.array(z.string()).optional(),
		'extend-exclude': z.array(z.string()).optional(),
		'extend-select': z.array(z.string()).optional(),
		fix: z.boolean().optional(),
		fixable: z.array(z.string()).optional(),
		format: formatSchema.optional(),
		ignore: z.array(z.string()).optional(),
		'indent-width': z.number().optional(),
		isort: z.object({}).loose().optional(),
		'line-length': z.number().optional(),
		lint: lintSchema.optional(),
		'per-file-ignores': z.record(z.string(), z.array(z.string())).optional(),
		preview: z.boolean().optional(),
		select: z.array(z.string()).optional(),
		src: z.array(z.string()).optional(),
		'target-version': z.string().optional(),
		unfixable: z.array(z.string()).optional(),
	})
	const object =
		unknownKeys === 'error' ? base.strict() : unknownKeys === 'strip' ? base : base.loose()
	return object.transform(
		({
			'extend-exclude': extendExclude,
			'extend-select': extendSelect,
			'indent-width': indentWidth,
			'line-length': lineLength,
			'per-file-ignores': perFileIgnores,
			'target-version': targetVersion,
			...rest
		}) => ({
			...rest,
			extendExclude,
			extendSelect,
			indentWidth,
			lineLength,
			perFileIgnores,
			targetVersion,
		}),
	)
}
