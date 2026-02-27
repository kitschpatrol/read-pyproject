import { z } from 'zod'
import { createBuildSystemSchema } from './build-system'
import { createProjectSchema } from './project'
import {
	createBlackSchema,
	createHatchSchema,
	createMypySchema,
	createPdmSchema,
	createPoetrySchema,
	createPytestSchema,
	createRuffSchema,
	createSetuptoolsSchema,
	createUvSchema,
} from './tool'

/**
 * Create the top-level pyproject.toml Zod schema.
 */
export function createPyprojectSchema(strict: boolean) {
	const toolShape = {
		black: createBlackSchema(strict).optional(),
		hatch: createHatchSchema(strict).optional(),
		mypy: createMypySchema(strict).optional(),
		pdm: createPdmSchema(strict).optional(),
		poetry: createPoetrySchema(strict).optional(),
		pytest: createPytestSchema(strict).optional(),
		ruff: createRuffSchema(strict).optional(),
		setuptools: createSetuptoolsSchema(strict).optional(),
		uv: createUvSchema(strict).optional(),
	}

	// Tool table is always loose so unknown tools pass through
	const tool = z.object(toolShape).loose()

	const shape = {
		'build-system': createBuildSystemSchema(strict).optional(),
		project: createProjectSchema(strict).optional(),
		tool: tool.optional(),
	}
	const base = z.object(shape)
	const object = strict ? base.strict() : base.loose()
	return object.transform(({ 'build-system': buildSystem, ...rest }) => ({
		...rest,
		buildSystem,
	}))
}
