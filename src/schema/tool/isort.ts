import { z } from 'zod'

// Isort stores booleans as actual booleans or legacy string "True"/"False"
const looseBoolean = z.union([z.boolean(), z.string()])

/**
 * Create a Zod schema for the [tool.isort] table.
 */
export function createIsortSchema(strict: boolean) {
	const base = z.object({
		// eslint-disable-next-line ts/naming-convention
		combine_as_imports: looseBoolean.optional(),
		// eslint-disable-next-line ts/naming-convention
		force_grid_wrap: z.number().optional(),
		// eslint-disable-next-line ts/naming-convention
		force_single_line: looseBoolean.optional(),
		// eslint-disable-next-line ts/naming-convention
		force_sort_within_sections: looseBoolean.optional(),
		// eslint-disable-next-line ts/naming-convention
		include_trailing_comma: looseBoolean.optional(),
		// eslint-disable-next-line ts/naming-convention
		known_first_party: z.union([z.string(), z.array(z.string())]).optional(),
		// eslint-disable-next-line ts/naming-convention
		known_third_party: z.union([z.string(), z.array(z.string())]).optional(),
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
		skip: z.union([z.string(), z.array(z.string())]).optional(),
		// eslint-disable-next-line ts/naming-convention
		skip_gitignore: looseBoolean.optional(),
		// eslint-disable-next-line ts/naming-convention
		src_paths: z.array(z.string()).optional(),
		// eslint-disable-next-line ts/naming-convention
		use_parentheses: looseBoolean.optional(),
	})
	const object = strict ? base.strict() : base.loose()
	return object.transform(
		({
			combine_as_imports: combineAsImports,
			force_grid_wrap: forceGridWrap,
			force_single_line: forceSingleLine,
			force_sort_within_sections: forceSortWithinSections,
			include_trailing_comma: includeTrailingComma,
			known_first_party: knownFirstParty,
			known_third_party: knownThirdParty,
			line_length: lineLength,
			lines_after_imports: linesAfterImports,
			lines_between_sections: linesBetweenSections,
			lines_between_types: linesBetweenTypes,
			multi_line_output: multiLineOutput,
			order_by_type: orderByType,
			py_version: pyVersion,
			skip_gitignore: skipGitignore,
			src_paths: srcPaths,
			use_parentheses: useParentheses,
			...rest
		}) => ({
			...rest,
			combineAsImports,
			forceGridWrap,
			forceSingleLine,
			forceSortWithinSections,
			includeTrailingComma,
			knownFirstParty,
			knownThirdParty,
			lineLength,
			linesAfterImports,
			linesBetweenSections,
			linesBetweenTypes,
			multiLineOutput,
			orderByType,
			pyVersion,
			skipGitignore,
			srcPaths,
			useParentheses,
		}),
	)
}
