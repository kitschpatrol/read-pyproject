import { z } from 'zod'
import type { UnknownKeys } from '../types'
import { createBuildSystemSchema } from './build-system'
import { createProjectSchema } from './project'
import {
	createAutopep8Schema,
	createBanditSchema,
	createBlackSchema,
	createBumpversionSchema,
	createCheckWheelContentsSchema,
	createCibuildwheelSchema,
	createCodespellSchema,
	createComfySchema,
	createCommitizenSchema,
	createCoverageSchema,
	createDagsterSchema,
	createDistutilsSchema,
	createDocformatterSchema,
	createFlake8Schema,
	createFlitSchema,
	createHatchSchema,
	createIsortSchema,
	createJupyterReleaserSchema,
	createMypySchema,
	createPdmSchema,
	createPixiSchema,
	createPoeSchema,
	createPoetrySchema,
	createPydocstyleSchema,
	createPylintSchema,
	createPyrightSchema,
	createPytestSchema,
	createRuffSchema,
	createSetuptoolsSchema,
	createSetuptoolsScmSchema,
	createTbumpSchema,
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
		autopep8: createAutopep8Schema(unknownKeys).optional(),
		bandit: createBanditSchema(unknownKeys).optional(),
		black: createBlackSchema(unknownKeys).optional(),
		bumpversion: createBumpversionSchema(unknownKeys).optional(),
		'check-wheel-contents': createCheckWheelContentsSchema(unknownKeys).optional(),
		cibuildwheel: createCibuildwheelSchema(unknownKeys).optional(),
		codespell: createCodespellSchema(unknownKeys).optional(),
		comfy: createComfySchema(unknownKeys).optional(),
		commitizen: createCommitizenSchema(unknownKeys).optional(),
		coverage: createCoverageSchema(unknownKeys).optional(),
		dagster: createDagsterSchema(unknownKeys).optional(),
		distutils: createDistutilsSchema(unknownKeys).optional(),
		docformatter: createDocformatterSchema(unknownKeys).optional(),
		flake8: createFlake8Schema(unknownKeys).optional(),
		flit: createFlitSchema(unknownKeys).optional(),
		hatch: createHatchSchema(unknownKeys).optional(),
		isort: createIsortSchema(unknownKeys).optional(),
		'jupyter-releaser': createJupyterReleaserSchema(unknownKeys).optional(),
		mypy: createMypySchema(unknownKeys).optional(),
		pdm: createPdmSchema(unknownKeys).optional(),
		pixi: createPixiSchema(unknownKeys).optional(),
		poe: createPoeSchema(unknownKeys).optional(),
		poetry: createPoetrySchema(unknownKeys).optional(),
		pydocstyle: createPydocstyleSchema(unknownKeys).optional(),
		pylint: createPylintSchema(unknownKeys).optional(),
		pyright: createPyrightSchema(unknownKeys).optional(),
		pytest: createPytestSchema(unknownKeys).optional(),
		ruff: createRuffSchema(unknownKeys).optional(),
		setuptools: createSetuptoolsSchema(unknownKeys).optional(),
		// eslint-disable-next-line ts/naming-convention
		setuptools_scm: createSetuptoolsScmSchema(unknownKeys).optional(),
		tbump: createTbumpSchema(unknownKeys).optional(),
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
		({
			'check-wheel-contents': checkWheelContents,
			'jupyter-releaser': jupyterReleaser,
			setuptools_scm: setuptoolsScm,
			...rest
		}) => ({
			...rest,
			checkWheelContents,
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
