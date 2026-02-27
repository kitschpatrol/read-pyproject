import { z } from 'zod'

/**
 * Create a Zod schema for the [tool.pytest] table.
 * @see [Pytest configuration reference](https://docs.pytest.org/en/stable/reference/customize.html)
 * @see [Pytest ini-options](https://docs.pytest.org/en/stable/reference/reference.html#ini-options-ref)
 */
export function createPytestSchema(strict: boolean) {
	const iniOptionsSchema = z
		.object({
			addopts: z.union([z.string(), z.array(z.string())]).optional(),
			filterwarnings: z.array(z.string()).optional(),
			markers: z.union([z.string(), z.array(z.string())]).optional(),
			minversion: z.union([z.string(), z.number()]).optional(),
			// eslint-disable-next-line ts/naming-convention
			python_classes: z.union([z.string(), z.array(z.string())]).optional(),
			// eslint-disable-next-line ts/naming-convention
			python_files: z.union([z.string(), z.array(z.string())]).optional(),
			// eslint-disable-next-line ts/naming-convention
			python_functions: z.union([z.string(), z.array(z.string())]).optional(),
			testpaths: z.union([z.string(), z.array(z.string())]).optional(),
		})
		.loose()
		.transform(
			({
				python_classes: pythonClasses,
				python_files: pythonFiles,
				python_functions: pythonFunctions,
				...rest
			}) => ({
				...rest,
				pythonClasses,
				pythonFiles,
				pythonFunctions,
			}),
		)

	const base = z.object({
		// eslint-disable-next-line ts/naming-convention
		ini_options: iniOptionsSchema.optional(),
	})
	const object = strict ? base.strict() : base.loose()
	return object.transform(({ ini_options: iniOptions, ...rest }) => ({
		...rest,
		iniOptions,
	}))
}
