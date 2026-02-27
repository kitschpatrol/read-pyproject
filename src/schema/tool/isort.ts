import { z } from 'zod'
import type { UnknownKeys } from '../../types'

// Isort stores booleans as actual booleans or legacy string "True"/"False"
const looseBoolean = z.union([z.boolean(), z.string()])

/**
 * Create a Zod schema for the [tool.isort] table.
 * @see [isort configuration reference](https://pycqa.github.io/isort/docs/configuration/options.html)
 */
export function createIsortSchema(unknownKeys: UnknownKeys) {
	const stringOrArray = z.union([z.string(), z.array(z.string())])

	const base = z.object({
		// eslint-disable-next-line ts/naming-convention
		add_imports: stringOrArray.optional(),
		atomic: looseBoolean.optional(),
		// eslint-disable-next-line ts/naming-convention
		color_output: looseBoolean.optional(),
		// eslint-disable-next-line ts/naming-convention
		combine_as_imports: looseBoolean.optional(),
		// eslint-disable-next-line ts/naming-convention
		default_section: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		ensure_newline_before_comments: looseBoolean.optional(),
		// eslint-disable-next-line ts/naming-convention
		extend_skip: stringOrArray.optional(),
		// eslint-disable-next-line ts/naming-convention
		force_alphabetical_sort_within_sections: looseBoolean.optional(),
		// eslint-disable-next-line ts/naming-convention
		force_grid_wrap: z.number().optional(),
		// eslint-disable-next-line ts/naming-convention
		force_single_line: looseBoolean.optional(),
		// eslint-disable-next-line ts/naming-convention
		force_sort_within_sections: looseBoolean.optional(),
		// eslint-disable-next-line ts/naming-convention
		forced_separate: z.array(z.string()).optional(),
		// eslint-disable-next-line ts/naming-convention
		ignore_whitespace: looseBoolean.optional(),
		// eslint-disable-next-line ts/naming-convention
		include_trailing_comma: looseBoolean.optional(),
		indent: z.union([z.number(), z.string()]).optional(),
		// eslint-disable-next-line ts/naming-convention
		known_first_party: stringOrArray.optional(),
		// eslint-disable-next-line ts/naming-convention
		known_third_party: stringOrArray.optional(),
		// eslint-disable-next-line ts/naming-convention
		length_sort: looseBoolean.optional(),
		// eslint-disable-next-line ts/naming-convention
		line_length: z.number().optional(),
		// eslint-disable-next-line ts/naming-convention
		lines_after_imports: z.number().optional(),
		// eslint-disable-next-line ts/naming-convention
		lines_between_sections: z.number().optional(),
		// eslint-disable-next-line ts/naming-convention
		lines_between_types: z.number().optional(),
		// eslint-disable-next-line ts/naming-convention
		multi_line_output: z.number().optional(),
		// eslint-disable-next-line ts/naming-convention
		order_by_type: looseBoolean.optional(),
		profile: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		py_version: z.union([z.string(), z.number()]).optional(),
		sections: stringOrArray.optional(),
		skip: stringOrArray.optional(),
		// eslint-disable-next-line ts/naming-convention
		skip_gitignore: looseBoolean.optional(),
		// eslint-disable-next-line ts/naming-convention
		skip_glob: stringOrArray.optional(),
		// eslint-disable-next-line ts/naming-convention
		split_on_trailing_comma: looseBoolean.optional(),
		// eslint-disable-next-line ts/naming-convention
		src_paths: z.array(z.string()).optional(),
		// eslint-disable-next-line ts/naming-convention
		use_parentheses: looseBoolean.optional(),
	})
	// Always loose — isort supports dynamic known_* sections (known_django, known_myapp, etc.)
	const object = unknownKeys === 'strip' ? base : base.loose()
	return object.transform(
		({
			add_imports: addImports,
			color_output: colorOutput,
			combine_as_imports: combineAsImports,
			default_section: defaultSection,
			ensure_newline_before_comments: ensureNewlineBeforeComments,
			extend_skip: extendSkip,
			force_alphabetical_sort_within_sections: forceAlphabeticalSortWithinSections,
			force_grid_wrap: forceGridWrap,
			force_single_line: forceSingleLine,
			force_sort_within_sections: forceSortWithinSections,
			forced_separate: forcedSeparate,
			ignore_whitespace: ignoreWhitespace,
			include_trailing_comma: includeTrailingComma,
			known_first_party: knownFirstParty,
			known_third_party: knownThirdParty,
			length_sort: lengthSort,
			line_length: lineLength,
			lines_after_imports: linesAfterImports,
			lines_between_sections: linesBetweenSections,
			lines_between_types: linesBetweenTypes,
			multi_line_output: multiLineOutput,
			order_by_type: orderByType,
			py_version: pyVersion,
			skip_gitignore: skipGitignore,
			skip_glob: skipGlob,
			split_on_trailing_comma: splitOnTrailingComma,
			src_paths: srcPaths,
			use_parentheses: useParentheses,
			...rest
		}) => ({
			...rest,
			addImports,
			colorOutput,
			combineAsImports,
			defaultSection,
			ensureNewlineBeforeComments,
			extendSkip,
			forceAlphabeticalSortWithinSections,
			forcedSeparate,
			forceGridWrap,
			forceSingleLine,
			forceSortWithinSections,
			ignoreWhitespace,
			includeTrailingComma,
			knownFirstParty,
			knownThirdParty,
			lengthSort,
			lineLength,
			linesAfterImports,
			linesBetweenSections,
			linesBetweenTypes,
			multiLineOutput,
			orderByType,
			pyVersion,
			skipGitignore,
			skipGlob,
			splitOnTrailingComma,
			srcPaths,
			useParentheses,
		}),
	)
}
