import { z } from 'zod'
import type { UnknownKeyPolicy } from '../../types'

/**
 * Create a Zod schema for the [tool.commitizen] table.
 * @see [Commitizen configuration](https://commitizen-tools.github.io/commitizen/config/configuration_file/)
 */
export function createCommitizenSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	const base = z.object({
		// eslint-disable-next-line ts/naming-convention
		allowed_prefixes: z.array(z.string()).optional(),
		// eslint-disable-next-line ts/naming-convention
		annotated_tag: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		breaking_change_exclamation_in_title: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		bump_message: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		changelog_file: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		changelog_format: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		changelog_incremental: z.boolean().optional(),
		encoding: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		gpg_sign: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		major_version_zero: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		message_length_limit: z.number().optional(),
		name: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		post_bump_hooks: z.array(z.string()).optional(),
		// eslint-disable-next-line ts/naming-convention
		pre_bump_hooks: z.array(z.string()).optional(),
		// eslint-disable-next-line ts/naming-convention
		prerelease_offset: z.number().optional(),
		style: z.array(z.unknown()).optional(),
		// eslint-disable-next-line ts/naming-convention
		tag_format: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		update_changelog_on_bump: z.boolean().optional(),
		version: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		version_files: z.array(z.string()).optional(),
		// eslint-disable-next-line ts/naming-convention
		version_provider: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		version_scheme: z.string().optional(),
	})

	const object =
		unknownKeyPolicy === 'error'
			? base.strict()
			: unknownKeyPolicy === 'strip'
				? base
				: base.loose()
	return object
}
