import { z } from 'zod'
import type { UnknownKeys } from '../../types'

/**
 * Create a Zod schema for the [tool.dagster] table.
 * @see [Dagster configuration reference](https://docs.dagster.io/guides/running-dagster-locally)
 */
export function createDagsterSchema(unknownKeys: UnknownKeys) {
	const base = z.object({
		// eslint-disable-next-line ts/naming-convention
		module_name: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		project_name: z.string().optional(),
	})
	const object =
		unknownKeys === 'error' ? base.strict() : unknownKeys === 'strip' ? base : base.loose()
	return object.transform(
		({ module_name: moduleName, project_name: projectName, ...rest }) => ({
			...rest,
			moduleName,
			projectName,
		}),
	)
}
