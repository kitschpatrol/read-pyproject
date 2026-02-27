import { z } from 'zod'
import type { UnknownKeyPolicy } from '../../types'

/** String or array of strings. */
const multiString = z.union([z.string(), z.array(z.string())])

/**
 * Create a Zod schema for the [tool.docformatter] table.
 * @see [Docformatter configuration](https://docformatter.readthedocs.io/en/latest/configuration.html)
 */
export function createDocformatterSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	const base = z.object({
		black: z.boolean().optional(),
		blank: z.boolean().optional(),
		'close-quotes-on-newline': z.boolean().optional(),
		exclude: multiString.optional(),
		'in-place': z.boolean().optional(),
		'pre-summary-newline': z.boolean().optional(),
		'pre-summary-space': z.boolean().optional(),
		recursive: z.boolean().optional(),
		'rest-section-adorns': z.string().optional(),
		style: z.string().optional(),
		'wrap-descriptions': z.number().optional(),
		'wrap-summaries': z.number().optional(),
	})

	const object =
		unknownKeyPolicy === 'error'
			? base.strict()
			: unknownKeyPolicy === 'strip'
				? base
				: base.loose()
	return object
}
