import { z } from 'zod'
import type { UnknownKeyPolicy } from '../../types'

/**
 * Create a Zod schema for the [tool.tbump] table.
 * @see [tbump configuration reference](https://github.com/your-tools/tbump)
 */
export function createTbumpSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	const fileSchema = z.object({}).loose()

	const versionBase = z.object({
		current: z.string().optional(),
		regex: z.string().optional(),
	})
	const versionSchema =
		unknownKeyPolicy === 'error'
			? versionBase.strict()
			: unknownKeyPolicy === 'strip'
				? versionBase
				: versionBase.loose()

	const gitBase = z.object({
		// eslint-disable-next-line ts/naming-convention
		message_template: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		push_remote: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		tag_template: z.string().optional(),
	})
	const gitObject =
		unknownKeyPolicy === 'error'
			? gitBase.strict()
			: unknownKeyPolicy === 'strip'
				? gitBase
				: gitBase.loose()
	const gitSchema = gitObject

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
		unknownKeyPolicy === 'error'
			? base.strict()
			: unknownKeyPolicy === 'strip'
				? base
				: base.loose()
	return object
}
