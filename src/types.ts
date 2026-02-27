import type { z } from 'zod'
import type { createBuildSystemSchema } from './schema/build-system'
import type { createProjectSchema } from './schema/project'
import type { createPyprojectSchema } from './schema/pyproject'

/**
 * Controls how unknown keys are handled during schema validation.
 * - `'passthrough'` — unknown keys are kept as-is (default)
 * - `'strip'` — unknown keys are silently removed
 * - `'error'` — unknown keys cause a validation error
 */
export type UnknownKeyPolicy = 'error' | 'passthrough' | 'strip'

type SchemaReturn<T extends (...args: never[]) => unknown> = ReturnType<T>

export type PyprojectData = z.output<SchemaReturn<typeof createPyprojectSchema>>
export type ProjectData = z.output<SchemaReturn<typeof createProjectSchema>>
export type BuildSystemData = z.output<SchemaReturn<typeof createBuildSystemSchema>>
