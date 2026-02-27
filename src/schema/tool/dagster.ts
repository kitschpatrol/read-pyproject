import { z } from 'zod'
import type { UnknownKeyPolicy } from '../../types'

/**
 * Create a Zod schema for the [tool.dagster] table.
 * @see [Dagster configuration reference](https://docs.dagster.io/guides/running-dagster-locally)
 */
export function createDagsterSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	const base = z.object({
		// eslint-disable-next-line ts/naming-convention
		module_name: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		project_name: z.string().optional(),
	})
	const object =
		unknownKeyPolicy === 'error'
			? base.strict()
			: unknownKeyPolicy === 'strip'
				? base
				: base.loose()
	return object
}
