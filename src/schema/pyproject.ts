import { z } from 'zod'
import type { UnknownKeyPolicy } from '../types'
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

/**
 * Create the top-level pyproject.toml Zod schema.
 */
export function createPyprojectSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	const includeBase = z.object({
		'include-group': z.string(),
	})
	const includeObject =
		unknownKeyPolicy === 'error'
			? includeBase.strict()
			: unknownKeyPolicy === 'strip'
				? includeBase
				: includeBase.loose()
	const dependencyGroupIncludeSchema = includeObject.transform(
		({ 'include-group': includeGroup }) => ({
			includeGroup,
		}),
	)

	const dependencyGroupItemSchema = z.union([z.string(), dependencyGroupIncludeSchema])

	const dependencyGroupsSchema = z.record(
		z.string(),
		z.union([z.array(dependencyGroupItemSchema), z.unknown()]),
	)
	const toolShape = {
		autopep8: createAutopep8Schema(unknownKeyPolicy).optional(),
		bandit: createBanditSchema(unknownKeyPolicy).optional(),
		black: createBlackSchema(unknownKeyPolicy).optional(),
		bumpversion: createBumpversionSchema(unknownKeyPolicy).optional(),
		'check-wheel-contents': createCheckWheelContentsSchema(unknownKeyPolicy).optional(),
		cibuildwheel: createCibuildwheelSchema(unknownKeyPolicy).optional(),
		codespell: createCodespellSchema(unknownKeyPolicy).optional(),
		comfy: createComfySchema(unknownKeyPolicy).optional(),
		commitizen: createCommitizenSchema(unknownKeyPolicy).optional(),
		coverage: createCoverageSchema(unknownKeyPolicy).optional(),
		dagster: createDagsterSchema(unknownKeyPolicy).optional(),
		distutils: createDistutilsSchema(unknownKeyPolicy).optional(),
		docformatter: createDocformatterSchema(unknownKeyPolicy).optional(),
		flake8: createFlake8Schema(unknownKeyPolicy).optional(),
		flit: createFlitSchema(unknownKeyPolicy).optional(),
		hatch: createHatchSchema(unknownKeyPolicy).optional(),
		isort: createIsortSchema(unknownKeyPolicy).optional(),
		'jupyter-releaser': createJupyterReleaserSchema(unknownKeyPolicy).optional(),
		mypy: createMypySchema(unknownKeyPolicy).optional(),
		pdm: createPdmSchema(unknownKeyPolicy).optional(),
		pixi: createPixiSchema(unknownKeyPolicy).optional(),
		poe: createPoeSchema(unknownKeyPolicy).optional(),
		poetry: createPoetrySchema(unknownKeyPolicy).optional(),
		pydocstyle: createPydocstyleSchema(unknownKeyPolicy).optional(),
		pylint: createPylintSchema(unknownKeyPolicy).optional(),
		pyright: createPyrightSchema(unknownKeyPolicy).optional(),
		pytest: createPytestSchema(unknownKeyPolicy).optional(),
		ruff: createRuffSchema(unknownKeyPolicy).optional(),
		setuptools: createSetuptoolsSchema(unknownKeyPolicy).optional(),
		// eslint-disable-next-line ts/naming-convention
		setuptools_scm: createSetuptoolsScmSchema(unknownKeyPolicy).optional(),
		tbump: createTbumpSchema(unknownKeyPolicy).optional(),
		towncrier: createTowncrierSchema(unknownKeyPolicy).optional(),
		uv: createUvSchema(unknownKeyPolicy).optional(),
		yapf: createYapfSchema(unknownKeyPolicy).optional(),
	}

	// Tool table respects unknownKeyPolicy so unknown tools are handled accordingly
	const toolBase = z.object(toolShape)
	const tool = (
		unknownKeyPolicy === 'error'
			? toolBase.strict()
			: unknownKeyPolicy === 'strip'
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
		'build-system': createBuildSystemSchema(unknownKeyPolicy).optional(),
		'dependency-groups': dependencyGroupsSchema.optional(),
		project: createProjectSchema(unknownKeyPolicy).optional(),
		tool: tool.optional(),
	}
	const base = z.object(shape)
	const object =
		unknownKeyPolicy === 'error'
			? base.strict()
			: unknownKeyPolicy === 'strip'
				? base
				: base.loose()
	return object.transform(
		({ 'build-system': buildSystem, 'dependency-groups': dependencyGroups, ...rest }) => ({
			...rest,
			buildSystem,
			dependencyGroups,
		}),
	)
}
