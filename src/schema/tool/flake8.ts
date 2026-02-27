import { z } from 'zod'

/** String or array of strings. */
const multiString = z.union([z.string(), z.array(z.string())])

/**
 * Create a Zod schema for the [tool.flake8] table.
 */
export function createFlake8Schema(strict: boolean) {
	const base = z.object({
		builtins: multiString.optional(),
		'copyright-check': z.boolean().optional(),
		count: z.boolean().optional(),
		'disable-noqa': z.boolean().optional(),
		doctests: z.boolean().optional(),
		'enable-extensions': multiString.optional(),
		exclude: multiString.optional(),
		'extend-exclude': multiString.optional(),
		'extend-ignore': multiString.optional(),
		'extend-select': multiString.optional(),
		filename: multiString.optional(),
		format: z.string().optional(),
		'hang-closing': z.boolean().optional(),
		ignore: multiString.optional(),
		'indent-size': z.number().optional(),
		jobs: z.number().optional(),
		'max-complexity': z.number().optional(),
		'max-doc-length': z.number().optional(),
		'max-line-length': z.number().optional(),
		'per-file-ignores': multiString.optional(),
		quiet: z.boolean().optional(),
		'require-plugins': multiString.optional(),
		select: multiString.optional(),
		'show-source': z.boolean().optional(),
		statistics: z.boolean().optional(),
		tee: z.boolean().optional(),
	})

	const object = strict ? base.strict() : base.loose()
	return object.transform(
		({
			'copyright-check': copyrightCheck,
			'disable-noqa': disableNoqa,
			'enable-extensions': enableExtensions,
			'extend-exclude': extendExclude,
			'extend-ignore': extendIgnore,
			'extend-select': extendSelect,
			'hang-closing': hangClosing,
			'indent-size': indentSize,
			'max-complexity': maxComplexity,
			'max-doc-length': maxDocLength,
			'max-line-length': maxLineLength,
			'per-file-ignores': perFileIgnores,
			'require-plugins': requirePlugins,
			'show-source': showSource,
			...rest
		}) => ({
			...rest,
			copyrightCheck,
			disableNoqa,
			enableExtensions,
			extendExclude,
			extendIgnore,
			extendSelect,
			hangClosing,
			indentSize,
			maxComplexity,
			maxDocLength,
			maxLineLength,
			perFileIgnores,
			requirePlugins,
			showSource,
		}),
	)
}
