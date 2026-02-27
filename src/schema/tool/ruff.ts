import { z } from 'zod'
import type { UnknownKeyPolicy } from '../../types'

/**
 * Create a Zod schema for the [tool.ruff] table.
 * @see [Ruff configuration reference](https://docs.astral.sh/ruff/configuration/)
 * @see [Ruff settings](https://docs.astral.sh/ruff/settings/)
 */
export function createRuffSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	// Ruff's lint section has many per-linter sub-sections (pydocstyle, mccabe, flake8-*, etc.)
	// beyond what we model, so always allow unknown keys.
	const lintBase = z.object({
		'extend-select': z.array(z.string()).optional(),
		fixable: z.array(z.string()).optional(),
		ignore: z.array(z.string()).optional(),
		isort: z.object({}).loose().optional(),
		'per-file-ignores': z.record(z.string(), z.array(z.string())).optional(),
		select: z.array(z.string()).optional(),
	})
	const lintObject = unknownKeyPolicy === 'strip' ? lintBase : lintBase.loose()
	const lintSchema = lintObject

	// Ruff's format section has many more options than we model, so always allow unknown keys.
	const formatBase = z.object({
		'docstring-code-format': z.boolean().optional(),
		'indent-style': z.string().optional(),
		'line-ending': z.string().optional(),
		'quote-style': z.string().optional(),
	})
	const formatObject = unknownKeyPolicy === 'strip' ? formatBase : formatBase.loose()
	const formatSchema = formatObject

	// Ruff has many per-linter sub-sections (flake8-*, mccabe, pyupgrade, etc.)
	// that can appear at the top level in legacy config format.
	const linterSubSection = z.object({}).loose().optional()

	const base = z.object({
		builtins: z.array(z.string()).optional(),
		exclude: z.array(z.string()).optional(),
		'extend-exclude': z.array(z.string()).optional(),
		'extend-fixable': z.array(z.string()).optional(),
		'extend-select': z.array(z.string()).optional(),
		fix: z.boolean().optional(),
		fixable: z.array(z.string()).optional(),
		'flake8-quotes': linterSubSection,
		'flake8-tidy-imports': linterSubSection,
		format: formatSchema.optional(),
		ignore: z.array(z.string()).optional(),
		'ignore-init-module-imports': z.boolean().optional(),
		include: z.array(z.string()).optional(),
		'indent-width': z.number().optional(),
		isort: z.object({}).loose().optional(),
		'line-length': z.number().optional(),
		lint: lintSchema.optional(),
		mccabe: linterSubSection,
		'output-format': z.string().optional(),
		'per-file-ignores': z.record(z.string(), z.array(z.string())).optional(),
		preview: z.boolean().optional(),
		pyupgrade: linterSubSection,
		select: z.array(z.string()).optional(),
		'show-fixes': z.boolean().optional(),
		src: z.array(z.string()).optional(),
		'target-version': z.string().optional(),
		unfixable: z.array(z.string()).optional(),
	})
	const object =
		unknownKeyPolicy === 'error'
			? base.strict()
			: unknownKeyPolicy === 'strip'
				? base
				: base.loose()
	return object
}
