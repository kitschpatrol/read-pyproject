import { z } from 'zod'
import type { UnknownKeys } from '../../types'

/**
 * Create a Zod schema for the [tool.comfy] table.
 * @see [ComfyUI custom node configuration](https://docs.comfy.org/comfy-cli/getting-started)
 */
export function createComfySchema(unknownKeys: UnknownKeys) {
	const base = z.object({
		// eslint-disable-next-line ts/naming-convention
		DisplayName: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		Icon: z.string().optional(),
		// eslint-disable-next-line ts/naming-convention
		PublisherId: z.string().optional(),
		includes: z.array(z.string()).optional(),
	})
	const object =
		unknownKeys === 'error' ? base.strict() : unknownKeys === 'strip' ? base : base.loose()
	return object.transform(
		({ DisplayName: displayName, Icon: icon, PublisherId: publisherId, ...rest }) => ({
			...rest,
			displayName,
			icon,
			publisherId,
		}),
	)
}
