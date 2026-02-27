import { z } from 'zod'
import type { UnknownKeyPolicy } from '../../types'

/**
 * Create a Zod schema for the [tool.bandit] table.
 * @see [Bandit configuration reference](https://bandit.readthedocs.io/en/latest/config.html)
 */
export function createBanditSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	const base = z.object({
		exclude: z.union([z.string(), z.array(z.string())]).optional(),
		// eslint-disable-next-line ts/naming-convention
		exclude_dirs: z.array(z.string()).optional(),
		skips: z.array(z.string()).optional(),
		targets: z.array(z.string()).optional(),
		tests: z.array(z.string()).optional(),
	})
	// Always loose — bandit uses dynamic per-check sub-sections (assert_used, etc.)
	const object = unknownKeyPolicy === 'strip' ? base : base.loose()
	return object.transform(({ exclude_dirs: excludeDirectories, ...rest }) => ({
		...rest,
		excludeDirectories,
	}))
}
