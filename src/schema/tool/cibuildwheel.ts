import { z } from 'zod'
import type { UnknownKeyPolicy } from '../../types'

/**
 * Create a Zod schema for the [tool.cibuildwheel] table.
 * @see [cibuildwheel configuration reference](https://cibuildwheel.pypa.io/en/stable/options/)
 */
export function createCibuildwheelSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	const platformOverrideSchema = z.object({}).loose()

	const base = z.object({
		archs: z.union([z.string(), z.array(z.string())]).optional(),
		'before-all': z.union([z.string(), z.array(z.string())]).optional(),
		'before-build': z.union([z.string(), z.array(z.string())]).optional(),
		'before-test': z.union([z.string(), z.array(z.string())]).optional(),
		build: z.union([z.string(), z.array(z.string())]).optional(),
		'build-frontend': z.union([z.string(), z.object({}).loose()]).optional(),
		environment: z.record(z.string(), z.string()).optional(),
		linux: platformOverrideSchema.optional(),
		macos: platformOverrideSchema.optional(),
		skip: z.union([z.string(), z.array(z.string())]).optional(),
		'test-command': z.union([z.string(), z.array(z.string())]).optional(),
		'test-extras': z.union([z.string(), z.array(z.string())]).optional(),
		'test-requires': z.union([z.string(), z.array(z.string())]).optional(),
		'test-skip': z.union([z.string(), z.array(z.string())]).optional(),
		windows: platformOverrideSchema.optional(),
	})
	const object =
		unknownKeyPolicy === 'error' ? base.strict() : unknownKeyPolicy === 'strip' ? base : base.loose()
	return object.transform(
		({
			'before-all': beforeAll,
			'before-build': beforeBuild,
			'before-test': beforeTest,
			'build-frontend': buildFrontend,
			'test-command': testCommand,
			'test-extras': testExtras,
			'test-requires': testRequires,
			'test-skip': testSkip,
			...rest
		}) => ({
			...rest,
			beforeAll,
			beforeBuild,
			beforeTest,
			buildFrontend,
			testCommand,
			testExtras,
			testRequires,
			testSkip,
		}),
	)
}
