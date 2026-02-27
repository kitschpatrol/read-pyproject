import { z } from 'zod'
import type { UnknownKeyPolicy } from '../../types'

// Isort stores booleans as actual booleans or legacy string "True"/"False"
const looseBoolean = z.union([z.boolean(), z.string()])

/**
 * Create a Zod schema for the [tool.isort] table.
 * @see [isort configuration reference](https://pycqa.github.io/isort/docs/configuration/options.html)
 */
export function createIsortSchema(unknownKeyPolicy: UnknownKeyPolicy) {
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
	const object = unknownKeyPolicy === 'strip' ? base : base.loose()
	return object
}
