import { z } from 'zod'

/**
 * Create a Zod schema for the [tool.bumpversion] table.
 * @see [Bump My Version configuration reference](https://callowayproject.github.io/bump-my-version/reference/configuration/)
 */
export function createBumpversionSchema(strict: boolean) {
	const fileSchema = z
		.object({
			// eslint-disable-next-line ts/naming-convention
			exclude_bumps: z.array(z.string()).optional(),
			filename: z.string().optional(),
			glob: z.string().optional(),
			// eslint-disable-next-line ts/naming-convention
			glob_exclude: z.array(z.string()).optional(),
			// eslint-disable-next-line ts/naming-convention
			ignore_missing_file: z.boolean().optional(),
			// eslint-disable-next-line ts/naming-convention
			ignore_missing_version: z.boolean().optional(),
			// eslint-disable-next-line ts/naming-convention
			include_bumps: z.array(z.string()).optional(),
			parse: z.string().optional(),
			regex: z.boolean().optional(),
			replace: z.string().optional(),
			search: z.string().optional(),
			serialize: z.array(z.string()).optional(),
		})
		.loose()

	const base = z.object({
		// eslint-disable-next-line ts/naming-convention
		allow_dirty: z.boolean().optional(),
		commit: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		commit_args: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		current_version: z.string().optional(),
		files: z.array(fileSchema).optional(),
		// eslint-disable-next-line ts/naming-convention
		ignore_missing_files: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		ignore_missing_version: z.boolean().optional(),
		message: z.string().optional(),
		parse: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		post_commit_hooks: z.array(z.string()).optional(),
		// eslint-disable-next-line ts/naming-convention
		pre_commit_hooks: z.array(z.string()).optional(),
		regex: z.boolean().optional(),
		replace: z.string().optional(),
		search: z.string().optional(),
		serialize: z.array(z.string()).optional(),
		// eslint-disable-next-line ts/naming-convention
		sign_tags: z.boolean().optional(),
		tag: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		tag_message: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		tag_name: z.string().optional(),
	})

	const object = strict ? base.strict() : base.loose()
	return object.transform(
		({
			allow_dirty: allowDirty,
			commit_args: commitArgs,
			current_version: currentVersion,
			ignore_missing_files: ignoreMissingFiles,
			ignore_missing_version: ignoreMissingVersion,
			post_commit_hooks: postCommitHooks,
			pre_commit_hooks: preCommitHooks,
			sign_tags: signTags,
			tag_message: tagMessage,
			tag_name: tagName,
			...rest
		}) => ({
			...rest,
			allowDirty,
			commitArgs,
			currentVersion,
			ignoreMissingFiles,
			ignoreMissingVersion,
			postCommitHooks,
			preCommitHooks,
			signTags,
			tagMessage,
			tagName,
		}),
	)
}
