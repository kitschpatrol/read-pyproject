import { z } from 'zod'
import type { UnknownKeyPolicy } from '../../types'

/**
 * Create a Zod schema for the [tool.pylint] table.
 * @see [Pylint configuration reference](https://pylint.readthedocs.io/en/latest/user_guide/configuration/index.html)
 */
export function createPylintSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	// Pylint uses many dynamic sub-sections (messages_control, "messages control",
	// "MESSAGES CONTROL", main, format, basic, classes, reports, etc.) with
	// arbitrary keys, so we use a loose record for maximum compatibility.
	const base = z.object({
		disable: z.union([z.string(), z.array(z.string())]).optional(),
		enable: z.union([z.string(), z.array(z.string())]).optional(),
		'fail-on': z.union([z.string(), z.array(z.string())]).optional(),
		'good-names': z.union([z.string(), z.array(z.string())]).optional(),
		'ignore-paths': z.array(z.string()).optional(),
		'ignore-patterns': z.array(z.string()).optional(),
		jobs: z.number().optional(),
		'load-plugins': z.array(z.string()).optional(),
		'max-args': z.number().optional(),
		'max-branches': z.number().optional(),
		'max-line-length': z.union([z.number(), z.string()]).optional(),
		'max-locals': z.number().optional(),
		'max-nested-blocks': z.number().optional(),
		'max-positional-arguments': z.number().optional(),
		'max-statements': z.number().optional(),
		'py-version': z.union([z.string(), z.array(z.number())]).optional(),
	})
	// Always loose — pylint uses many dynamic sub-sections (messages_control,
	// "MESSAGES CONTROL", format, main, basic, classes, reports, etc.)
	const object = unknownKeyPolicy === 'strip' ? base : base.loose()
	return object.transform(
		({
			'fail-on': failOn,
			'good-names': goodNames,
			'ignore-paths': ignorePaths,
			'ignore-patterns': ignorePatterns,
			'load-plugins': loadPlugins,
			'max-args': maxArgs,
			'max-branches': maxBranches,
			'max-line-length': maxLineLength,
			'max-locals': maxLocals,
			'max-nested-blocks': maxNestedBlocks,
			'max-positional-arguments': maxPositionalArguments,
			'max-statements': maxStatements,
			'py-version': pyVersion,
			...rest
		}) => ({
			...rest,
			failOn,
			goodNames,
			ignorePaths,
			ignorePatterns,
			loadPlugins,
			maxArgs,
			maxBranches,
			maxLineLength,
			maxLocals,
			maxNestedBlocks,
			maxPositionalArguments,
			maxStatements,
			pyVersion,
		}),
	)
}
