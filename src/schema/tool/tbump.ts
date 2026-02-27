import { z } from 'zod'
import type { UnknownKeys } from '../../types'

/**
 * Create a Zod schema for the [tool.tbump] table.
 * @see [tbump configuration reference](https://github.com/your-tools/tbump)
 */
export function createTbumpSchema(unknownKeys: UnknownKeys) {
	const fileSchema = z.object({}).loose()

	const versionSchema = z
		.object({
			current: z.string().optional(),
			regex: z.string().optional(),
		})
		.loose()

	const gitSchema = z
		.object({
			// eslint-disable-next-line ts/naming-convention
			message_template: z.string().optional(),
			// eslint-disable-next-line ts/naming-convention
			push_remote: z.string().optional(),
			// eslint-disable-next-line ts/naming-convention
			tag_template: z.string().optional(),
		})
		.loose()
		.transform(
			({
				message_template: messageTemplate,
				push_remote: pushRemote,
				tag_template: tagTemplate,
				...rest
			}) => ({
				...rest,
				messageTemplate,
				pushRemote,
				tagTemplate,
			}),
		)

	const hookSchema = z.object({}).loose()

	const base = z.object({
		// eslint-disable-next-line ts/naming-convention
		before_commit: z.array(hookSchema).optional(),
		file: z.array(fileSchema).optional(),
		git: gitSchema.optional(),
		// eslint-disable-next-line ts/naming-convention
		github_url: z.string().optional(),
		version: versionSchema.optional(),
	})
	const object =
		unknownKeys === 'error' ? base.strict() : unknownKeys === 'strip' ? base : base.loose()
	return object.transform(
		({ before_commit: beforeCommit, github_url: githubUrl, ...rest }) => ({
			...rest,
			beforeCommit,
			githubUrl,
		}),
	)
}
