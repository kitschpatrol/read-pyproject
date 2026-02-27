import { z } from 'zod'
import type { UnknownKeys } from '../../types'

const fragmentTypeSchema = z.object({
	check: z.boolean().optional(),
	directory: z.string().optional(),
	name: z.string().optional(),
	showcontent: z.boolean().optional(),
})

/**
 * Create a Zod schema for the [tool.towncrier] table.
 * @see [Towncrier configuration reference](https://towncrier.readthedocs.io/en/stable/configuration.html)
 */
export function createTowncrierSchema(unknownKeys: UnknownKeys) {
	const base = z.object({
		// eslint-disable-next-line ts/naming-convention
		all_bullets: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		create_add_extension: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		create_eof_newline: z.boolean().optional(),
		directory: z.string().optional(),
		filename: z.string().optional(),
		ignore: z.array(z.string()).optional(),
		// eslint-disable-next-line ts/naming-convention
		issue_format: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		issue_pattern: z.string().optional(),
		name: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		orphan_prefix: z.string().optional(),
		package: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		package_dir: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		single_file: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		start_string: z.string().optional(),
		template: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		title_format: z.union([z.string(), z.boolean()]).optional(),
		type: z.array(fragmentTypeSchema).optional(),
		underlines: z.array(z.string()).optional(),
		version: z.string().optional(),
		wrap: z.boolean().optional(),
	})

	const object =
		unknownKeys === 'error' ? base.strict() : unknownKeys === 'strip' ? base : base.loose()
	return object.transform(
		({
			all_bullets: allBullets,
			create_add_extension: createAddExtension,
			create_eof_newline: createEofNewline,
			issue_format: issueFormat,
			issue_pattern: issuePattern,
			orphan_prefix: orphanPrefix,
			package_dir: packageDirectory,
			single_file: singleFile,
			start_string: startString,
			title_format: titleFormat,
			...rest
		}) => ({
			...rest,
			allBullets,
			createAddExtension,
			createEofNewline,
			issueFormat,
			issuePattern,
			orphanPrefix,
			packageDirectory,
			singleFile,
			startString,
			titleFormat,
		}),
	)
}
