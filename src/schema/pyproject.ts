import { z } from 'zod'
import { createBuildSystemSchema } from './build-system'
import { createProjectSchema } from './project'
import {
	createBlackSchema,
	createCoverageSchema,
	createHatchSchema,
	createIsortSchema,
	createMypySchema,
	createPdmSchema,
	createPoetrySchema,
	createPyrightSchema,
	createPytestSchema,
	createRuffSchema,
	createSetuptoolsSchema,
	createSetuptoolsScmSchema,
	createUvSchema,
} from './tool'

const dependencyGroupIncludeSchema = z
	.object({
		'include-group': z.string(),
	})
	.loose()
	.transform(({ 'include-group': includeGroup }) => ({
		includeGroup,
	}))

const dependencyGroupItemSchema = z.union([z.string(), dependencyGroupIncludeSchema])

const dependencyGroupsSchema = z.record(
	z.string(),
	z.union([z.array(dependencyGroupItemSchema), z.unknown()]),
)

/**
 * Create the top-level pyproject.toml Zod schema.
 */
export function createPyprojectSchema(strict: boolean) {
	const toolShape = {
		black: createBlackSchema(strict).optional(),
		coverage: createCoverageSchema(strict).optional(),
		hatch: createHatchSchema(strict).optional(),
		isort: createIsortSchema(strict).optional(),
		mypy: createMypySchema(strict).optional(),
		pdm: createPdmSchema(strict).optional(),
		poetry: createPoetrySchema(strict).optional(),
		pyright: createPyrightSchema(strict).optional(),
		pytest: createPytestSchema(strict).optional(),
		ruff: createRuffSchema(strict).optional(),
		setuptools: createSetuptoolsSchema(strict).optional(),
		// eslint-disable-next-line ts/naming-convention
		setuptools_scm: createSetuptoolsScmSchema(strict).optional(),
		uv: createUvSchema(strict).optional(),
	}

	// Tool table is always loose so unknown tools pass through
	const tool = z
		.object(toolShape)
		.loose()
		.transform(({ setuptools_scm: setuptoolsScm, ...rest }) => ({
			...rest,
			setuptoolsScm,
		}))

	const shape = {
		'build-system': createBuildSystemSchema(strict).optional(),
		'dependency-groups': dependencyGroupsSchema.optional(),
		project: createProjectSchema(strict).optional(),
		tool: tool.optional(),
	}
	const base = z.object(shape)
	const object = strict ? base.strict() : base.loose()
	return object.transform(
		({ 'build-system': buildSystem, 'dependency-groups': dependencyGroups, ...rest }) => ({
			...rest,
			buildSystem,
			dependencyGroups,
		}),
	)
}
