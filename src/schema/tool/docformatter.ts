import { z } from 'zod'

/** String or array of strings. */
const multiString = z.union([z.string(), z.array(z.string())])

/**
 * Create a Zod schema for the [tool.docformatter] table.
 * @see [Docformatter configuration](https://docformatter.readthedocs.io/en/latest/configuration.html)
 */
export function createDocformatterSchema(strict: boolean) {
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

	const object = strict ? base.strict() : base.loose()
	return object.transform(
		({
			'close-quotes-on-newline': closeQuotesOnNewline,
			'in-place': inPlace,
			'pre-summary-newline': preSummaryNewline,
			'pre-summary-space': preSummarySpace,
			'rest-section-adorns': restSectionAdorns,
			'wrap-descriptions': wrapDescriptions,
			'wrap-summaries': wrapSummaries,
			...rest
		}) => ({
			...rest,
			closeQuotesOnNewline,
			inPlace,
			preSummaryNewline,
			preSummarySpace,
			restSectionAdorns,
			wrapDescriptions,
			wrapSummaries,
		}),
	)
}
