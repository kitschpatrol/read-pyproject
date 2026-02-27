import { z } from 'zod'
import type { UnknownKeys } from '../../types'

/**
 * Create a Zod schema for the [tool.mypy] table.
 * @see [Mypy configuration reference](https://mypy.readthedocs.io/en/stable/config_file.html)
 */
export function createMypySchema(unknownKeys: UnknownKeys) {
	const overrideSchema = z.object({}).loose()

	const base = z.object({
		// eslint-disable-next-line ts/naming-convention
		check_untyped_defs: z.boolean().optional(),
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
		exclude: z.union([z.string(), z.array(z.string())]).optional(),
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
		mypy_path: z.union([z.string(), z.array(z.string())]).optional(),
		// eslint-disable-next-line ts/naming-convention
		namespace_packages: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		no_implicit_optional: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		no_implicit_reexport: z.boolean().optional(),
		overrides: z.array(overrideSchema).optional(),
		plugins: z.array(z.string()).optional(),
		// eslint-disable-next-line ts/naming-convention
		python_version: z.union([z.string(), z.number()]).optional(),
		// eslint-disable-next-line ts/naming-convention
		show_error_codes: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		show_error_context: z.boolean().optional(),
		strict: z.boolean().optional(),
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
		unknownKeys === 'error' ? base.strict() : unknownKeys === 'strip' ? base : base.loose()
	return object.transform(
		({
			check_untyped_defs: checkUntypedDefs,
			disallow_any_decorated: disallowAnyDecorated,
			disallow_any_generics: disallowAnyGenerics,
			disallow_any_unimported: disallowAnyUnimported,
			disallow_incomplete_defs: disallowIncompleteDefs,
			disallow_subclassing_any: disallowSubclassingAny,
			disallow_untyped_calls: disallowUntypedCalls,
			disallow_untyped_decorators: disallowUntypedDecorators,
			disallow_untyped_defs: disallowUntypedDefs,
			enable_error_code: enableErrorCode,
			explicit_package_bases: explicitPackageBases,
			follow_imports: followImports,
			ignore_errors: ignoreErrors,
			ignore_missing_imports: ignoreMissingImports,
			mypy_path: mypyPath,
			namespace_packages: namespacePackages,
			no_implicit_optional: noImplicitOptional,
			no_implicit_reexport: noImplicitReexport,
			python_version: pythonVersion,
			show_error_codes: showErrorCodes,
			show_error_context: showErrorContext,
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
			checkUntypedDefs,
			disallowAnyDecorated,
			disallowAnyGenerics,
			disallowAnyUnimported,
			disallowIncompleteDefs,
			disallowSubclassingAny,
			disallowUntypedCalls,
			disallowUntypedDecorators,
			disallowUntypedDefs,
			enableErrorCode,
			explicitPackageBases,
			followImports,
			ignoreErrors,
			ignoreMissingImports,
			mypyPath,
			namespacePackages,
			noImplicitOptional,
			noImplicitReexport,
			pythonVersion,
			showErrorCodes,
			showErrorContext,
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
