import { z } from 'zod'
import type { UnknownKeyPolicy } from '../../types'

/**
 * Create a Zod schema for the [tool.setuptools_scm] table.
 * @see [Setuptools-scm configuration reference](https://setuptools-scm.readthedocs.io/en/latest/config/)
 */
export function createSetuptoolsScmSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	const base = z.object({
		// eslint-disable-next-line ts/naming-convention
		dist_name: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		fallback_root: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		fallback_version: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		local_scheme: z.string().optional(),
		normalize: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		parentdir_prefix_version: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		relative_to: z.string().optional(),
		root: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		search_parent_directories: z.boolean().optional(),
		// eslint-disable-next-line ts/naming-convention
		tag_regex: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		version_cls: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		version_file: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		version_file_template: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		version_scheme: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		write_to: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		write_to_template: z.string().optional(),
	})

	const object =
		unknownKeyPolicy === 'error' ? base.strict() : unknownKeyPolicy === 'strip' ? base : base.loose()
	return object.transform(
		({
			dist_name: distributionName,
			fallback_root: fallbackRoot,
			fallback_version: fallbackVersion,
			local_scheme: localScheme,
			parentdir_prefix_version: parentdirPrefixVersion,
			relative_to: relativeTo,
			search_parent_directories: searchParentDirectories,
			tag_regex: tagRegex,
			version_cls: versionClass,
			version_file: versionFile,
			version_file_template: versionFileTemplate,
			version_scheme: versionScheme,
			write_to: writeTo,
			write_to_template: writeToTemplate,
			...rest
		}) => ({
			...rest,
			distributionName,
			fallbackRoot,
			fallbackVersion,
			localScheme,
			parentdirPrefixVersion,
			relativeTo,
			searchParentDirectories,
			tagRegex,
			versionClass,
			versionFile,
			versionFileTemplate,
			versionScheme,
			writeTo,
			writeToTemplate,
		}),
	)
}
