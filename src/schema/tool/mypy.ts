import { z } from 'zod'

/**
 * Create a Zod schema for the [tool.mypy] table.
 */
export function createMypySchema(strict: boolean) {
	const overrideSchema = z.object({}).loose()

	const base = z.object({
		// eslint-disable-next-line ts/naming-convention
		disallow_untyped_defs: z.boolean().optional(),
		exclude: z.union([z.string(), z.array(z.string())]).optional(),
		files: z.union([z.string(), z.array(z.string())]).optional(),
		// eslint-disable-next-line ts/naming-convention
		ignore_missing_imports: z.boolean().optional(),
		overrides: z.array(overrideSchema).optional(),
		plugins: z.array(z.string()).optional(),
		// eslint-disable-next-line ts/naming-convention
		python_version: z.union([z.string(), z.number()]).optional(),
		strict: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		warn_return_any: z.boolean().optional(),
	})
	const object = strict ? base.strict() : base.loose()
	return object.transform(
		({
			disallow_untyped_defs: disallowUntypedDefs,
			ignore_missing_imports: ignoreMissingImports,
			python_version: pythonVersion,
			warn_return_any: warnReturnAny,
			...rest
		}) => ({
			...rest,
			disallowUntypedDefs,
			ignoreMissingImports,
			pythonVersion,
			warnReturnAny,
		}),
	)
}
