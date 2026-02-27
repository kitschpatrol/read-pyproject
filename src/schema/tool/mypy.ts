import { z } from 'zod'
import type { UnknownKeyPolicy } from '../../types'

/**
 * Create a Zod schema for the [tool.mypy] table.
 * @see [Mypy configuration reference](https://mypy.readthedocs.io/en/stable/config_file.html)
 */
export function createMypySchema(unknownKeyPolicy: UnknownKeyPolicy) {
	const overrideSchema = z.object({}).loose()

	const base = z.object({
		// eslint-disable-next-line ts/naming-convention
		allow_redefinition: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		allow_subclassing_any: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		allow_untyped_globals: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		check_untyped_defs: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		color_output: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		disable_error_code: z.union([z.string(), z.array(z.string())]).optional(),
		// eslint-disable-next-line ts/naming-convention
		disallow_any_decorated: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		disallow_any_generics: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		disallow_any_unimported: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		disallow_incomplete_defs: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		disallow_subclassing_any: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		disallow_untyped_calls: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		disallow_untyped_decorators: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		disallow_untyped_defs: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		enable_error_code: z.union([z.string(), z.array(z.string())]).optional(),
		// eslint-disable-next-line ts/naming-convention
		error_summary: z.boolean().optional(),
		exclude: z.union([z.string(), z.array(z.string())]).optional(),
		// eslint-disable-next-line ts/naming-convention
		exclude_gitignore: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		explicit_package_bases: z.boolean().optional(),
		files: z.union([z.string(), z.array(z.string())]).optional(),
		// eslint-disable-next-line ts/naming-convention
		follow_imports: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		ignore_errors: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		ignore_missing_imports: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		implicit_reexport: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		local_partial_types: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		mypy_path: z.union([z.string(), z.array(z.string())]).optional(),
		// eslint-disable-next-line ts/naming-convention
		namespace_packages: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		no_implicit_optional: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		no_implicit_reexport: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		no_site_packages: z.boolean().optional(),
		overrides: z.array(overrideSchema).optional(),
		packages: z.union([z.string(), z.array(z.string())]).optional(),
		plugins: z.array(z.string()).optional(),
		pretty: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		python_version: z.union([z.string(), z.number()]).optional(),
		// eslint-disable-next-line ts/naming-convention
		show_column_numbers: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		show_error_codes: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		show_error_context: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		show_traceback: z.boolean().optional(),
		strict: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		strict_concatenate: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		strict_equality: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		strict_optional: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		warn_no_return: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		warn_redundant_casts: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		warn_return_any: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		warn_unreachable: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		warn_unused_configs: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		warn_unused_ignores: z.boolean().optional(),
	})
	const object =
		unknownKeyPolicy === 'error' ? base.strict() : unknownKeyPolicy === 'strip' ? base : base.loose()
	return object.transform(
		({
			allow_redefinition: allowRedefinition,
			allow_subclassing_any: allowSubclassingAny,
			allow_untyped_globals: allowUntypedGlobals,
			check_untyped_defs: checkUntypedDefs,
			color_output: colorOutput,
			disable_error_code: disableErrorCode,
			disallow_any_decorated: disallowAnyDecorated,
			disallow_any_generics: disallowAnyGenerics,
			disallow_any_unimported: disallowAnyUnimported,
			disallow_incomplete_defs: disallowIncompleteDefs,
			disallow_subclassing_any: disallowSubclassingAny,
			disallow_untyped_calls: disallowUntypedCalls,
			disallow_untyped_decorators: disallowUntypedDecorators,
			disallow_untyped_defs: disallowUntypedDefs,
			enable_error_code: enableErrorCode,
			error_summary: errorSummary,
			exclude_gitignore: excludeGitignore,
			explicit_package_bases: explicitPackageBases,
			follow_imports: followImports,
			ignore_errors: ignoreErrors,
			ignore_missing_imports: ignoreMissingImports,
			implicit_reexport: implicitReexport,
			local_partial_types: localPartialTypes,
			mypy_path: mypyPath,
			namespace_packages: namespacePackages,
			no_implicit_optional: noImplicitOptional,
			no_implicit_reexport: noImplicitReexport,
			no_site_packages: noSitePackages,
			python_version: pythonVersion,
			show_column_numbers: showColumnNumbers,
			show_error_codes: showErrorCodes,
			show_error_context: showErrorContext,
			show_traceback: showTraceback,
			strict_concatenate: strictConcatenate,
			strict_equality: strictEquality,
			strict_optional: strictOptional,
			warn_no_return: warnNoReturn,
			warn_redundant_casts: warnRedundantCasts,
			warn_return_any: warnReturnAny,
			warn_unreachable: warnUnreachable,
			warn_unused_configs: warnUnusedConfigs,
			warn_unused_ignores: warnUnusedIgnores,
			...rest
		}) => ({
			...rest,
			allowRedefinition,
			allowSubclassingAny,
			allowUntypedGlobals,
			checkUntypedDefs,
			colorOutput,
			disableErrorCode,
			disallowAnyDecorated,
			disallowAnyGenerics,
			disallowAnyUnimported,
			disallowIncompleteDefs,
			disallowSubclassingAny,
			disallowUntypedCalls,
			disallowUntypedDecorators,
			disallowUntypedDefs,
			enableErrorCode,
			errorSummary,
			excludeGitignore,
			explicitPackageBases,
			followImports,
			ignoreErrors,
			ignoreMissingImports,
			implicitReexport,
			localPartialTypes,
			mypyPath,
			namespacePackages,
			noImplicitOptional,
			noImplicitReexport,
			noSitePackages,
			pythonVersion,
			showColumnNumbers,
			showErrorCodes,
			showErrorContext,
			showTraceback,
			strictConcatenate,
			strictEquality,
			strictOptional,
			warnNoReturn,
			warnRedundantCasts,
			warnReturnAny,
			warnUnreachable,
			warnUnusedConfigs,
			warnUnusedIgnores,
		}),
	)
}
