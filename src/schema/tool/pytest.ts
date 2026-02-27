import { z } from 'zod'
import type { UnknownKeys } from '../../types'

/**
 * Create a Zod schema for the [tool.pytest] table.
 * @see [Pytest configuration reference](https://docs.pytest.org/en/stable/reference/customize.html)
 * @see [Pytest ini-options](https://docs.pytest.org/en/stable/reference/reference.html#ini-options-ref)
 */
export function createPytestSchema(unknownKeys: UnknownKeys) {
	const stringOrArray = z.union([z.string(), z.array(z.string())])

	const iniOptionsSchema = z
		.object({
			addopts: stringOrArray.optional(),
			// eslint-disable-next-line ts/naming-convention
			asyncio_mode: z.string().optional(),
			// eslint-disable-next-line ts/naming-convention
			consider_namespace_packages: z.boolean().optional(),
			// eslint-disable-next-line ts/naming-convention
			console_output_style: z.string().optional(),
			// eslint-disable-next-line ts/naming-convention
			doctest_optionflags: stringOrArray.optional(),
			env: z.array(z.string()).optional(),
			filterwarnings: z.array(z.string()).optional(),
			// eslint-disable-next-line ts/naming-convention
			junit_family: z.string().optional(),
			// eslint-disable-next-line ts/naming-convention
			log_cli: z.union([z.boolean(), z.string()]).optional(),
			// eslint-disable-next-line ts/naming-convention
			log_cli_level: z.string().optional(),
			markers: stringOrArray.optional(),
			minversion: z.union([z.string(), z.number()]).optional(),
			norecursedirs: stringOrArray.optional(),
			// eslint-disable-next-line ts/naming-convention
			python_classes: stringOrArray.optional(),
			// eslint-disable-next-line ts/naming-convention
			python_files: stringOrArray.optional(),
			// eslint-disable-next-line ts/naming-convention
			python_functions: stringOrArray.optional(),
			pythonpath: stringOrArray.optional(),
			// eslint-disable-next-line ts/naming-convention
			qt_api: z.string().optional(),
			testpaths: stringOrArray.optional(),
		})
		.loose()
		.transform(
			({
				asyncio_mode: asyncioMode,
				consider_namespace_packages: considerNamespacePackages,
				console_output_style: consoleOutputStyle,
				doctest_optionflags: doctestOptionflags,
				junit_family: junitFamily,
				log_cli: logCli,
				log_cli_level: logCliLevel,
				python_classes: pythonClasses,
				python_files: pythonFiles,
				python_functions: pythonFunctions,
				qt_api: qtApi,
				...rest
			}) => ({
				...rest,
				asyncioMode,
				considerNamespacePackages,
				consoleOutputStyle,
				doctestOptionflags,
				junitFamily,
				logCli,
				logCliLevel,
				pythonClasses,
				pythonFiles,
				pythonFunctions,
				qtApi,
			}),
		)

	const base = z.object({
		// eslint-disable-next-line ts/naming-convention
		ini_options: iniOptionsSchema.optional(),
	})
	const object =
		unknownKeys === 'error' ? base.strict() : unknownKeys === 'strip' ? base : base.loose()
	return object.transform(({ ini_options: iniOptions, ...rest }) => ({
		...rest,
		iniOptions,
	}))
}
