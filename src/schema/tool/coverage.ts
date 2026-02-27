import { z } from 'zod'
import type { UnknownKeyPolicy } from '../../types'

/** String or array of strings, common in coverage.py config. */
const multiString = z.union([z.string(), z.array(z.string())])

/**
 * Create a Zod schema for the [tool.coverage] table.
 * @see [Coverage.py configuration reference](https://coverage.readthedocs.io/en/latest/config.html)
 */
export function createCoverageSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	const runShape = z.object({
		branch: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		command_line: z.string().optional(),
		concurrency: multiString.optional(),
		context: z.string().optional(),
		core: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		cover_pylib: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		data_file: z.string().optional(),
		debug: multiString.optional(),
		// eslint-disable-next-line ts/naming-convention
		debug_file: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		disable_warnings: multiString.optional(),
		// eslint-disable-next-line ts/naming-convention
		dynamic_context: z.string().optional(),
		include: multiString.optional(),
		omit: multiString.optional(),
		parallel: z.boolean().optional(),
		patch: multiString.optional(),
		plugins: multiString.optional(),
		// eslint-disable-next-line ts/naming-convention
		relative_files: z.boolean().optional(),
		sigterm: z.boolean().optional(),
		source: multiString.optional(),
		// eslint-disable-next-line ts/naming-convention
		source_dirs: multiString.optional(),
		// eslint-disable-next-line ts/naming-convention
		source_pkgs: multiString.optional(),
		timid: z.boolean().optional(),
	})

	const reportShape = z.object({
		// eslint-disable-next-line ts/naming-convention
		exclude_also: multiString.optional(),
		// eslint-disable-next-line ts/naming-convention
		exclude_lines: multiString.optional(),
		// eslint-disable-next-line ts/naming-convention
		fail_under: z.number().optional(),
		format: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		ignore_errors: z.boolean().optional(),
		include: multiString.optional(),
		// eslint-disable-next-line ts/naming-convention
		include_namespace_packages: z.boolean().optional(),
		omit: multiString.optional(),
		// eslint-disable-next-line ts/naming-convention
		partial_also: multiString.optional(),
		// eslint-disable-next-line ts/naming-convention
		partial_branches: multiString.optional(),
		precision: z.number().optional(),
		// eslint-disable-next-line ts/naming-convention
		show_missing: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		skip_covered: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		skip_empty: z.boolean().optional(),
		sort: z.string().optional(),
	})

	const htmlShape = z.object({
		directory: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		extra_css: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		show_contexts: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		skip_covered: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		skip_empty: z.boolean().optional(),
		title: z.string().optional(),
	})

	const xmlShape = z.object({
		output: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		package_depth: z.number().optional(),
	})

	const jsonShape = z.object({
		output: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		pretty_print: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		show_contexts: z.boolean().optional(),
	})

	const lcovShape = z.object({
		// eslint-disable-next-line ts/naming-convention
		line_checksums: z.boolean().optional(),
		output: z.string().optional(),
	})

	// [tool.coverage.paths] uses user-defined keys with list-of-string values
	const pathsSchema = z.record(z.string(), z.array(z.string()))

	const runTransformed =
		unknownKeyPolicy === 'error'
			? runShape.strict()
			: unknownKeyPolicy === 'strip'
				? runShape
				: runShape.loose()

	const reportTransformed =
		unknownKeyPolicy === 'error'
			? reportShape.strict()
			: unknownKeyPolicy === 'strip'
				? reportShape
				: reportShape.loose()

	const htmlTransformed =
		unknownKeyPolicy === 'error'
			? htmlShape.strict()
			: unknownKeyPolicy === 'strip'
				? htmlShape
				: htmlShape.loose()

	const xmlTransformed =
		unknownKeyPolicy === 'error'
			? xmlShape.strict()
			: unknownKeyPolicy === 'strip'
				? xmlShape
				: xmlShape.loose()

	const jsonTransformed =
		unknownKeyPolicy === 'error'
			? jsonShape.strict()
			: unknownKeyPolicy === 'strip'
				? jsonShape
				: jsonShape.loose()

	const lcovTransformed =
		unknownKeyPolicy === 'error'
			? lcovShape.strict()
			: unknownKeyPolicy === 'strip'
				? lcovShape
				: lcovShape.loose()

	const base = z.object({
		html: htmlTransformed.optional(),
		json: jsonTransformed.optional(),
		lcov: lcovTransformed.optional(),
		paths: pathsSchema.optional(),
		report: reportTransformed.optional(),
		run: runTransformed.optional(),
		xml: xmlTransformed.optional(),
	})

	const object =
		unknownKeyPolicy === 'error'
			? base.strict()
			: unknownKeyPolicy === 'strip'
				? base
				: base.loose()
	return object
}
