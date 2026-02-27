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
		unknownKeyPolicy === 'error'
			? base.strict()
			: unknownKeyPolicy === 'strip'
				? base
				: base.loose()
	return object
}
