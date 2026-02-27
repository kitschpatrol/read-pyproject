import { z } from 'zod'
import type { UnknownKeys } from '../types'
import { createBuildSystemSchema } from './build-system'
import { createProjectSchema } from './project'
import {
	createBlackSchema,
	createBumpversionSchema,
	createCodespellSchema,
	createCommitizenSchema,
	createCoverageSchema,
	createDocformatterSchema,
	createFlake8Schema,
	createHatchSchema,
	createIsortSchema,
	createJupyterReleaserSchema,
	createMypySchema,
	createPdmSchema,
	createPoeSchema,
	createPoetrySchema,
	createPylintSchema,
	createPyrightSchema,
	createPytestSchema,
	createRuffSchema,
	createSetuptoolsSchema,
	createSetuptoolsScmSchema,
	createTowncrierSchema,
	createUvSchema,
	createYapfSchema,
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
export function createPyprojectSchema(unknownKeys: UnknownKeys) {
	const toolShape = {
		black: createBlackSchema(unknownKeys).optional(),
		bumpversion: createBumpversionSchema(unknownKeys).optional(),
		codespell: createCodespellSchema(unknownKeys).optional(),
		commitizen: createCommitizenSchema(unknownKeys).optional(),
		coverage: createCoverageSchema(unknownKeys).optional(),
		docformatter: createDocformatterSchema(unknownKeys).optional(),
		flake8: createFlake8Schema(unknownKeys).optional(),
		hatch: createHatchSchema(unknownKeys).optional(),
		isort: createIsortSchema(unknownKeys).optional(),
		'jupyter-releaser': createJupyterReleaserSchema(unknownKeys).optional(),
		mypy: createMypySchema(unknownKeys).optional(),
		pdm: createPdmSchema(unknownKeys).optional(),
		poe: createPoeSchema(unknownKeys).optional(),
		poetry: createPoetrySchema(unknownKeys).optional(),
		pylint: createPylintSchema(unknownKeys).optional(),
		pyright: createPyrightSchema(unknownKeys).optional(),
		pytest: createPytestSchema(unknownKeys).optional(),
		ruff: createRuffSchema(unknownKeys).optional(),
		setuptools: createSetuptoolsSchema(unknownKeys).optional(),
		// eslint-disable-next-line ts/naming-convention
		setuptools_scm: createSetuptoolsScmSchema(unknownKeys).optional(),
		towncrier: createTowncrierSchema(unknownKeys).optional(),
		uv: createUvSchema(unknownKeys).optional(),
		yapf: createYapfSchema(unknownKeys).optional(),
	}

	// Tool table respects unknownKeys so unknown tools are handled accordingly
	const toolBase = z.object(toolShape)
	const tool = (
		unknownKeys === 'error'
			? toolBase.strict()
			: unknownKeys === 'strip'
				? toolBase
				: toolBase.loose()
	).transform(
		({ 'jupyter-releaser': jupyterReleaser, setuptools_scm: setuptoolsScm, ...rest }) => ({
			...rest,
			jupyterReleaser,
			setuptoolsScm,
		}),
	)

	const shape = {
		'build-system': createBuildSystemSchema(unknownKeys).optional(),
		'dependency-groups': dependencyGroupsSchema.optional(),
		project: createProjectSchema(unknownKeys).optional(),
		tool: tool.optional(),
	}
	const base = z.object(shape)
	const object =
		unknownKeys === 'error' ? base.strict() : unknownKeys === 'strip' ? base : base.loose()
	return object.transform(
		({ 'build-system': buildSystem, 'dependency-groups': dependencyGroups, ...rest }) => ({
			...rest,
			buildSystem,
			dependencyGroups,
		}),
	)
}
