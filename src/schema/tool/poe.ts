import { z } from 'zod'
import type { UnknownKeys } from '../../types'

/** String or array of strings. */
const multiString = z.union([z.string(), z.array(z.string())])

/**
 * Create a Zod schema for the [tool.poe] table.
 * @see [Poe the Poet configuration reference](https://poethepoet.natn.io/global_options.html)
 * @see [Poe the Poet task options](https://poethepoet.natn.io/tasks/options.html)
 */
export function createPoeSchema(unknownKeys: UnknownKeys) {
	const base = z.object({
		'default-array-item-task-type': z.string().optional(),
		'default-array-task-type': z.string().optional(),
		'default-task-type': z.string().optional(),
		env: z.record(z.string(), z.string()).optional(),
		envfile: multiString.optional(),
		executor: z.union([z.string(), z.object({ type: z.string() }).loose()]).optional(),
		include: z
			.union([z.string(), z.array(z.union([z.string(), z.record(z.string(), z.string())]))])
			.optional(),
		'poetry-command': z.string().optional(),
		'poetry-hooks': z.record(z.string(), z.string()).optional(),
		'shell-interpreter': multiString.optional(),
		tasks: z.record(z.string(), z.unknown()).optional(),
		verbosity: z.number().optional(),
	})

	const object =
		unknownKeys === 'error' ? base.strict() : unknownKeys === 'strip' ? base : base.loose()
	return object.transform(
		({
			'default-array-item-task-type': defaultArrayItemTaskType,
			'default-array-task-type': defaultArrayTaskType,
			'default-task-type': defaultTaskType,
			'poetry-command': poetryCommand,
			'poetry-hooks': poetryHooks,
			'shell-interpreter': shellInterpreter,
			...rest
		}) => ({
			...rest,
			defaultArrayItemTaskType,
			defaultArrayTaskType,
			defaultTaskType,
			poetryCommand,
			poetryHooks,
			shellInterpreter,
		}),
	)
}
