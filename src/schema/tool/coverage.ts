import { z } from 'zod'

/** String or array of strings, common in coverage.py config. */
const multiString = z.union([z.string(), z.array(z.string())])

/**
 * Create a Zod schema for the [tool.coverage] table.
 */
export function createCoverageSchema(strict: boolean) {
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

	const runTransformed = (strict ? runShape.strict() : runShape.loose()).transform(
		({
			// eslint-disable-next-line ts/naming-convention
			command_line: commandLine,
			// eslint-disable-next-line ts/naming-convention
			cover_pylib: coverPylib,
			// eslint-disable-next-line ts/naming-convention
			data_file: dataFile,
			// eslint-disable-next-line ts/naming-convention
			debug_file: debugFile,
			// eslint-disable-next-line ts/naming-convention
			disable_warnings: disableWarnings,
			// eslint-disable-next-line ts/naming-convention
			dynamic_context: dynamicContext,
			// eslint-disable-next-line ts/naming-convention
			relative_files: relativeFiles,
			// eslint-disable-next-line ts/naming-convention
			source_dirs: sourceDirs,
			// eslint-disable-next-line ts/naming-convention
			source_pkgs: sourcePkgs,
			...rest
		}) => ({
			...rest,
			commandLine,
			coverPylib,
			dataFile,
			debugFile,
			disableWarnings,
			dynamicContext,
			relativeFiles,
			sourceDirs,
			sourcePkgs,
		}),
	)

	const reportTransformed = (strict ? reportShape.strict() : reportShape.loose()).transform(
		({
			// eslint-disable-next-line ts/naming-convention
			exclude_also: excludeAlso,
			// eslint-disable-next-line ts/naming-convention
			exclude_lines: excludeLines,
			// eslint-disable-next-line ts/naming-convention
			fail_under: failUnder,
			// eslint-disable-next-line ts/naming-convention
			ignore_errors: ignoreErrors,
			// eslint-disable-next-line ts/naming-convention
			include_namespace_packages: includeNamespacePackages,
			// eslint-disable-next-line ts/naming-convention
			partial_also: partialAlso,
			// eslint-disable-next-line ts/naming-convention
			partial_branches: partialBranches,
			// eslint-disable-next-line ts/naming-convention
			show_missing: showMissing,
			// eslint-disable-next-line ts/naming-convention
			skip_covered: skipCovered,
			// eslint-disable-next-line ts/naming-convention
			skip_empty: skipEmpty,
			...rest
		}) => ({
			...rest,
			excludeAlso,
			excludeLines,
			failUnder,
			ignoreErrors,
			includeNamespacePackages,
			partialAlso,
			partialBranches,
			showMissing,
			skipCovered,
			skipEmpty,
		}),
	)

	const htmlTransformed = (strict ? htmlShape.strict() : htmlShape.loose()).transform(
		({
			// eslint-disable-next-line ts/naming-convention
			extra_css: extraCss,
			// eslint-disable-next-line ts/naming-convention
			show_contexts: showContexts,
			// eslint-disable-next-line ts/naming-convention
			skip_covered: skipCovered,
			// eslint-disable-next-line ts/naming-convention
			skip_empty: skipEmpty,
			...rest
		}) => ({
			...rest,
			extraCss,
			showContexts,
			skipCovered,
			skipEmpty,
		}),
	)

	const xmlTransformed = (strict ? xmlShape.strict() : xmlShape.loose()).transform(
		({
			// eslint-disable-next-line ts/naming-convention
			package_depth: packageDepth,
			...rest
		}) => ({
			...rest,
			packageDepth,
		}),
	)

	const jsonTransformed = (strict ? jsonShape.strict() : jsonShape.loose()).transform(
		({
			// eslint-disable-next-line ts/naming-convention
			pretty_print: prettyPrint,
			// eslint-disable-next-line ts/naming-convention
			show_contexts: showContexts,
			...rest
		}) => ({
			...rest,
			prettyPrint,
			showContexts,
		}),
	)

	const lcovTransformed = (strict ? lcovShape.strict() : lcovShape.loose()).transform(
		({
			// eslint-disable-next-line ts/naming-convention
			line_checksums: lineChecksums,
			...rest
		}) => ({
			...rest,
			lineChecksums,
		}),
	)

	const base = z.object({
		html: htmlTransformed.optional(),
		json: jsonTransformed.optional(),
		lcov: lcovTransformed.optional(),
		paths: pathsSchema.optional(),
		report: reportTransformed.optional(),
		run: runTransformed.optional(),
		xml: xmlTransformed.optional(),
	})

	const object = strict ? base.strict() : base.loose()
	return object
}
