import { z } from 'zod'
import type { UnknownKeyPolicy } from '../../types'

/**
 * Create a Zod schema for the [tool.yapf] table.
 *
 * YAPF has 100+ style knobs. This schema covers the most common options
 * seen in real-world pyproject.toml files. Unknown keys pass through in
 * passthrough mode.
 * @see [YAPF knobs reference](https://github.com/google/yapf#knobs)
 */
export function createYapfSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	const base = z.object({
		// eslint-disable-next-line ts/naming-convention
		allow_split_before_dict_value: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		based_on_style: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		coalesce_brackets: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		column_limit: z.number().optional(),
		// eslint-disable-next-line ts/naming-convention
		continuation_indent_width: z.number().optional(),
		// eslint-disable-next-line ts/naming-convention
		dedent_closing_brackets: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		indent_width: z.number().optional(),
		// eslint-disable-next-line ts/naming-convention
		space_between_ending_comma_and_closing_bracket: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		spaces_around_power_operator: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		spaces_before_comment: z.number().optional(),
		// eslint-disable-next-line ts/naming-convention
		split_before_closing_bracket: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		split_before_first_argument: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		split_before_logical_operator: z.boolean().optional(),
	})

	// Always loose — YAPF has 100+ style knobs
	const object =
		unknownKeyPolicy === 'error' ? base.strict() : unknownKeyPolicy === 'strip' ? base : base.loose()
	return object.transform(
		({
			allow_split_before_dict_value: allowSplitBeforeDictValue,
			based_on_style: basedOnStyle,
			coalesce_brackets: coalesceBrackets,
			column_limit: columnLimit,
			continuation_indent_width: continuationIndentWidth,
			dedent_closing_brackets: dedentClosingBrackets,
			indent_width: indentWidth,
			space_between_ending_comma_and_closing_bracket: spaceBetweenEndingCommaAndClosingBracket,
			spaces_around_power_operator: spacesAroundPowerOperator,
			spaces_before_comment: spacesBeforeComment,
			split_before_closing_bracket: splitBeforeClosingBracket,
			split_before_first_argument: splitBeforeFirstArgument,
			split_before_logical_operator: splitBeforeLogicalOperator,
			...rest
		}) => ({
			...rest,
			allowSplitBeforeDictValue,
			basedOnStyle,
			coalesceBrackets,
			columnLimit,
			continuationIndentWidth,
			dedentClosingBrackets,
			indentWidth,
			spaceBetweenEndingCommaAndClosingBracket,
			spacesAroundPowerOperator,
			spacesBeforeComment,
			splitBeforeClosingBracket,
			splitBeforeFirstArgument,
			splitBeforeLogicalOperator,
		}),
	)
}
