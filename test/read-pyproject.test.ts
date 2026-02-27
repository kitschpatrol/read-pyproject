/* eslint-disable capitalized-comments */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { PyprojectError, readPyproject } from '../src'
import { correctSpdx, normalizePep503Name } from '../src/normalize'
import { createBuildSystemSchema } from '../src/schema/build-system'
import { createProjectSchema } from '../src/schema/project'
import { createPyprojectSchema } from '../src/schema/pyproject'

const fixturesDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'fixtures')

// ---------------------------------------------------------------------------
// File reading
// ---------------------------------------------------------------------------

describe('file reading', () => {
	it('reads from a direct file path', async () => {
		const files = await fs.readdir(fixturesDirectory)
		const first = files.find((f) => f.endsWith('.toml'))!
		const result = await readPyproject(path.join(fixturesDirectory, first))
		expect(result).toBeDefined()
	})

	it('reads from a directory path (appends pyproject.toml)', async () => {
		const temporaryDirectory = path.join(fixturesDirectory, '__tmp_dir_test__')
		await fs.mkdir(temporaryDirectory, { recursive: true })
		await fs.writeFile(
			path.join(temporaryDirectory, 'pyproject.toml'),
			'[project]\nname = "test-pkg"\n',
		)
		try {
			const result = await readPyproject(temporaryDirectory)
			expect(result.project?.name).toBe('test-pkg')
		} finally {
			await fs.rm(temporaryDirectory, { recursive: true })
		}
	})

	it('throws PyprojectError for missing file', async () => {
		await expect(readPyproject('/nonexistent/pyproject.toml')).rejects.toThrow(PyprojectError)
	})

	it('throws PyprojectError for invalid TOML', async () => {
		const temporaryDirectory = path.join(fixturesDirectory, '__tmp_invalid_toml__')
		await fs.mkdir(temporaryDirectory, { recursive: true })
		await fs.writeFile(path.join(temporaryDirectory, 'pyproject.toml'), '[invalid\nbroken toml =')
		try {
			await expect(readPyproject(temporaryDirectory)).rejects.toThrow(PyprojectError)
		} finally {
			await fs.rm(temporaryDirectory, { recursive: true })
		}
	})
})

// ---------------------------------------------------------------------------
// PEP 503 name normalization
// ---------------------------------------------------------------------------

describe('PEP 503 name normalization', () => {
	it('normalizes mixed separators', () => {
		expect(normalizePep503Name('My.Package_Name')).toBe('my-package-name')
	})

	it('collapses repeated separators', () => {
		expect(normalizePep503Name('UPPER---case')).toBe('upper-case')
	})

	it('preserves rawName on project', () => {
		const schema = createProjectSchema('passthrough')
		const result = schema.parse({ name: 'My.Package_Name' })
		expect(result.name).toBe('my-package-name')
		expect(result.rawName).toBe('My.Package_Name')
	})
})

// ---------------------------------------------------------------------------
// Readme normalization
// ---------------------------------------------------------------------------

describe('readme normalization', () => {
	it('normalizes string "README.md" to object with contentType', () => {
		const schema = createProjectSchema('passthrough')
		const result = schema.parse({ name: 'test', readme: 'README.md' })
		expect(result.readme).toEqual({ contentType: 'text/markdown', file: 'README.md' })
	})

	it('normalizes string "README.rst" to object with contentType', () => {
		const schema = createProjectSchema('passthrough')
		const result = schema.parse({ name: 'test', readme: 'README.rst' })
		expect(result.readme).toEqual({ contentType: 'text/x-rst', file: 'README.rst' })
	})

	it('normalizes table with file and content-type', () => {
		const schema = createProjectSchema('passthrough')
		const result = schema.parse({
			name: 'test',
			readme: { 'content-type': 'text/markdown', file: 'README.md' },
		})
		expect(result.readme).toEqual({ contentType: 'text/markdown', file: 'README.md' })
	})

	it('normalizes table with text and content-type', () => {
		const schema = createProjectSchema('passthrough')
		const result = schema.parse({
			name: 'test',
			readme: { 'content-type': 'text/plain', text: 'Hello world' },
		})
		expect(result.readme).toEqual({ contentType: 'text/plain', text: 'Hello world' })
	})
})

// ---------------------------------------------------------------------------
// License normalization & SPDX
// ---------------------------------------------------------------------------

describe('license normalization', () => {
	it('normalizes SPDX string "MIT" to {spdx: "MIT"}', () => {
		const schema = createProjectSchema('passthrough')
		const result = schema.parse({ license: 'MIT', name: 'test' })
		expect(result.license).toEqual({ spdx: 'MIT' })
	})

	it('normalizes table {file: "LICENSE"} as-is', () => {
		const schema = createProjectSchema('passthrough')
		const result = schema.parse({ license: { file: 'LICENSE' }, name: 'test' })
		expect(result.license).toEqual({ file: 'LICENSE' })
	})

	it('normalizes table {text: "..."} as-is', () => {
		const schema = createProjectSchema('passthrough')
		const result = schema.parse({ license: { text: 'MIT License...' }, name: 'test' })
		expect(result.license).toEqual({ text: 'MIT License...' })
	})

	it('corrects misspelled SPDX with spdx-correct', () => {
		expect(correctSpdx('GPL-3.0')).toBe('GPL-3.0')
	})

	it('throws for uncorrectable SPDX', () => {
		expect(() => correctSpdx('NOT-A-REAL-LICENSE-XYZ')).toThrow(PyprojectError)
	})
})

// ---------------------------------------------------------------------------
// camelCase conversion
// ---------------------------------------------------------------------------

describe('camelCase key conversion', () => {
	it('converts build-system keys', () => {
		const schema = createBuildSystemSchema('passthrough')
		const result = schema.parse({
			'backend-path': ['src'],
			'build-backend': 'setuptools.build_meta',
			requires: ['setuptools'],
		})
		expect(result.buildBackend).toBe('setuptools.build_meta')
		expect(result.backendPath).toEqual(['src'])
	})

	it('converts project kebab-case keys', () => {
		const schema = createProjectSchema('passthrough')
		const result = schema.parse({
			'entry-points': { group: { name: 'module:func' } },
			'gui-scripts': { app: 'app:main' },
			name: 'test',
			'optional-dependencies': { dev: ['pytest'] },
			'requires-python': '>=3.8',
		})
		expect(result.requiresPython).toBe('>=3.8')
		expect(result.optionalDependencies).toEqual({ dev: ['pytest'] })
		expect(result.guiScripts).toEqual({ app: 'app:main' })
		expect(result.entryPoints).toEqual({ group: { name: 'module:func' } })
	})

	it('converts top-level build-system key', () => {
		const schema = createPyprojectSchema('passthrough')
		const result = schema.parse({
			'build-system': { 'build-backend': 'setuptools.build_meta', requires: ['setuptools'] },
		})
		expect(result.buildSystem).toBeDefined()
		expect(result.buildSystem?.buildBackend).toBe('setuptools.build_meta')
	})
})

// ---------------------------------------------------------------------------
// PEP 735 dependency-groups
// ---------------------------------------------------------------------------

describe('PEP 735 dependency-groups', () => {
	it('parses string-only dependency groups', () => {
		const schema = createPyprojectSchema('passthrough')
		const result = schema.parse({
			'dependency-groups': {
				dev: ['pytest>=7', 'coverage'],
				docs: ['sphinx'],
			},
		})
		expect(result.dependencyGroups).toEqual({
			dev: ['pytest>=7', 'coverage'],
			docs: ['sphinx'],
		})
	})

	it('parses include-group references and camelCases the key', () => {
		const schema = createPyprojectSchema('passthrough')
		const result = schema.parse({
			'dependency-groups': {
				test: ['pytest>7'],
				'typing-test': [{ 'include-group': 'typing' }, { 'include-group': 'test' }, 'useful-types'],
			},
		})
		expect(result.dependencyGroups?.['typing-test']).toEqual([
			{ includeGroup: 'typing' },
			{ includeGroup: 'test' },
			'useful-types',
		])
	})

	it('camelCases the top-level dependency-groups key', () => {
		const schema = createPyprojectSchema('passthrough')
		const result = schema.parse({
			'dependency-groups': { dev: ['ruff'] },
		})
		expect(result.dependencyGroups).toBeDefined()
		expect('dependency-groups' in result).toBe(false)
	})
})

// ---------------------------------------------------------------------------
// Error cases
// ---------------------------------------------------------------------------

describe('unknownKeys modes', () => {
	it('error mode rejects unknown keys in project', () => {
		const schema = createProjectSchema('error')
		expect(() => schema.parse({ name: 'test', 'unknown-key': 'value' })).toThrow()
	})

	it('passthrough mode keeps unknown keys in project', () => {
		const schema = createProjectSchema('passthrough')
		const result = schema.parse({ name: 'test', 'unknown-key': 'value' })
		expect(result.name).toBe('test')
		expect((result as Record<string, unknown>)['unknown-key']).toBe('value')
	})

	it('strip mode silently removes unknown keys in project', () => {
		const schema = createProjectSchema('strip')
		const result = schema.parse({ name: 'test', 'unknown-key': 'value' })
		expect(result.name).toBe('test')
		expect('unknown-key' in result).toBe(false)
	})

	it('error mode rejects unknown tools in tool table', () => {
		const schema = createPyprojectSchema('error')
		expect(() =>
			schema.parse({
				tool: {
					// eslint-disable-next-line ts/naming-convention
					some_unknown_tool: { key: 'value' },
				},
			}),
		).toThrow()
	})

	it('strip mode removes unknown tools from tool table', () => {
		const schema = createPyprojectSchema('strip')
		const result = schema.parse({
			tool: {
				// eslint-disable-next-line ts/naming-convention
				some_unknown_tool: { key: 'value' },
			},
		})
		// eslint-disable-next-line ts/no-unsafe-type-assertion
		const tool = result.tool as Record<string, unknown>
		expect(tool.some_unknown_tool).toBeUndefined()
	})
})

// ---------------------------------------------------------------------------
// Unknown tool passthrough
// ---------------------------------------------------------------------------

describe('unknown tool passthrough', () => {
	it('passes through unknown tools as-is', () => {
		const schema = createPyprojectSchema('passthrough')
		const result = schema.parse({
			tool: {
				// eslint-disable-next-line ts/naming-convention
				some_unknown_tool: { key: 'value', nested: { a: 1 } },
			},
		})
		// eslint-disable-next-line ts/no-unsafe-type-assertion
		const tool = result.tool as Record<string, unknown>
		expect(tool.some_unknown_tool).toEqual({
			key: 'value',
			nested: { a: 1 },
		})
	})
})

// ---------------------------------------------------------------------------
// Real-world fixture smoke tests
// ---------------------------------------------------------------------------

describe('real-world fixtures', () => {
	it('parses all fixture files without throwing (non-strict)', { timeout: 60_000 }, async () => {
		const files = await fs.readdir(fixturesDirectory)
		const tomlFiles = files.filter((f) => f.endsWith('.toml'))
		expect(tomlFiles.length).toBeGreaterThan(300)

		const errors: Array<{ error: string; file: string }> = []

		await Promise.all(
			tomlFiles.map(async (file) => {
				try {
					await readPyproject(path.join(fixturesDirectory, file))
				} catch (error) {
					errors.push({
						error: error instanceof Error ? error.message : String(error),
						file,
					})
				}
			}),
		)

		if (errors.length > 0) {
			const summary = errors
				.slice(0, 10)
				.map((entry) => `  ${entry.file}: ${entry.error.split('\n')[0]}`)
				.join('\n')
			throw new Error(
				`${String(errors.length)}/${String(tomlFiles.length)} fixtures failed:\n${summary}`,
			)
		}
	})

	it(
		'parses non-blacklisted fixture files with error-level unknownKeys',
		{ timeout: 60_000 },
		async () => {
			// Fixtures that fail error-level validation.
			// Each entry is commented with the unrecognized keys / unknown tools causing the failure.
			const errorBlacklist = new Set([
				// unknown tool: crewai
				'agenticfsu-quantbot.pyproject.toml',
				// tool.pytest: doctest_optionflags; root-level: isort
				'alenai97-peft-mllm.pyproject.toml',
				// tool.pylint: "MESSAGES CONTROL"; tool.ruff: extended-select, show-fixes, target; unknown tool: oxt
				'amourspirit-libreoffice-python-path-ext.pyproject.toml',
				// tool.isort: split_on_trailing_comma
				'anyions-aws-tag-tools.pyproject.toml',
				// tool.mypy: allow_redefinition, pretty, show_traceback; tool.ruff: extend-fixable, mccabe; unknown tools: doc8, nbqa, poetry_bumpversion, poetry-sort
				'appliedai-gmbh-armscan-env.pyproject.toml',
				// tool.isort: known_typing
				'artefactory-streamlit-prophet.pyproject.toml',
				// tool.ruff: flake8-tidy-imports
				'aw1cks-cloud-latest.pyproject.toml',
				// unknown tool: kedro
				'bartoszzolkiewski-asi.pyproject.toml',
				// unknown tool: codeflash
				'bbelderbos-code-quality.pyproject.toml',
				// tool.mypy: pretty, show_column_numbers
				'bhrevol-dlsite-utils.pyproject.toml',
				// tool.black: python-version
				'biosustain-maudtools.pyproject.toml',
				// unknown tool: maturin; root-level: options
				'bk7084-framework.pyproject.toml',
				// tool.ruff: output-format
				'bopeng-ai-marketplace-monitor.pyproject.toml',
				// unknown tool: comfy
				'brekel-comfyui-brekel.pyproject.toml',
				// unknown tool: check-manifest
				'brisvag-waretomo.pyproject.toml',
				// tool.bandit: assert_used
				'bsc-wdc-dds.pyproject.toml',
				// tool.mypy: allow_redefinition, allow_untyped_globals, local_partial_types, disable_error_code
				'centreborelli-dem-evaluation.pyproject.toml',
				// tool.pyright: pyrightIgnoreModules
				'clarity-digital-twin-clarity-ai-jupyter.pyproject.toml',
				// tool.black: target_version
				'cloudchacho-hedwig-python.pyproject.toml',
				// tool.mypy: packages
				'cloudtruth-config-catalyst.pyproject.toml',
				// tool.mypy: allow_redefinition, allow_untyped_globals, local_partial_types, disable_error_code
				'cnes-demcompare.pyproject.toml',
				// tool.ruff: flake8-quotes
				'code-yeongyu-moragi.pyproject.toml',
				// tool.poetry: build; unknown tool: flakeheaven
				'craigtrim-lingpatlab.pyproject.toml',
				// tool.pylint: messages_control
				'darasiemi-mental-health-mlops-project.pyproject.toml',
				// tool.ruff: ignore-init-module-imports
				'digiklausur-e2xauthoring.pyproject.toml',
				// unknown tool: uv_build
				'douile-friends-queue.pyproject.toml',
				// tool.pylint: messages_control, format; root-level: tools
				'e-eight-pennylearn.pyproject.toml',
				// tool.pylint: "messages control", main, classes; tool.ruff: show-fixes; unknown tool: chango
				'eatsky1006-python-telegram-bot.pyproject.toml',
				// tool.isort: known_clients, known_engine, known_messages, known_services, known_schemas, known_subscribers, known_routers, known_utilities, known_config
				'epoikos-project-simulation.pyproject.toml',
				// tool.isort: force_alphabetical_sort_within_sections
				'esemanraro-masterhedge.pyproject.toml',
				// unknown tool: dagster
				'fearnworks-graphcap-prototype.pyproject.toml',
				// tool.poetry: build
				'fedora-infra-koji-fedoramessaging-messages.pyproject.toml',
				// tool.poetry: build
				'fedora-infra-rpmautospec-core.pyproject.toml',
				// root-level: poetry (not under tool)
				'firefly-cpp-arm-preprocessing.pyproject.toml',
				// tool.isort: atomic; unknown tool: pixi
				'fppdf-fppdf.pyproject.toml',
				// tool.mypy: no_site_packages
				'gagan3012-polydedupe.pyproject.toml',
				// unknown tool: bumpver
				'gardenerik-django-policies.pyproject.toml',
				// tool.pylint: "MESSAGES CONTROL"
				'hackersandslackers-flask-session-tutorial.pyproject.toml',
				// tool.ruff: pyupgrade
				'heysaeid-fastapi-fast-template.pyproject.toml',
				// tool.mypy: allow_untyped_globals, error_summary, pretty, disable_error_code; tool.pylint: main, messages_control, reports; unknown tool: pydocstyle
				'hypothesis-data-tasks.pyproject.toml',
				// tool.black: skip-numeric-underscore-normalization, target_version; unknown tool: dephell
				'ig248-tensorpandas.pyproject.toml',
				// unknown tool: scikit-build
				'iitpvisionlab-adrt.pyproject.toml',
				// root-level: poetry (not under tool)
				'inqbus-braille-radio.pyproject.toml',
				// tool.pytest: doctest_optionflags; root-level: isort
				'ist-daslab-peft-rosa.pyproject.toml',
				// tool.poetry: package-mode
				'jhordyess-calendar-generator.pyproject.toml',
				// tool.poetry: package-mode
				'joaquin-gael-text-predictor.pyproject.toml',
				// tool.poetry: requires-plugins; unknown tool: poetry-dynamic-versioning
				'kaisbn-openly.pyproject.toml',
				// unknown tool: dagster
				'kayrnt-dlt-iceberg-slack-backup.pyproject.toml',
				// unknown tool: pixi
				'khanlab-cfmm2tar.pyproject.toml',
				// tool.mypy: exclude_gitignore; tool.pytest: testpaths
				'lbhm-fedaugment.pyproject.toml',
				// tool.pylint: messages_control, format
				'lm-150a-docflash.pyproject.toml',
				// project: python, homepage, repository, documentation; root-level: dependencies
				'lorenanicole-eventbrite-scraper.pyproject.toml',
				// unknown tool: pydantic-mypy
				'lucas-six-python-cookbook.pyproject.toml',
				// tool.bandit: any_other_function_with_shell_equals_true; tool.isort: known_typing; tool.mypy: pretty, show_traceback, color_output, allow_redefinition, implicit_reexport, show_column_numbers; unknown tools: pydocstyle, interrogate, radon; root-level: coverage
				'maanibeigy-dash-boilerplate.pyproject.toml',
				// tool.poetry: package-mode
				'moj-analytical-services-moj-dlt-workshop.pyproject.toml',
				// tool.pytest: pythonpath, addopts; tool.ruff: output-format
				'monk-time-advent-of-code.pyproject.toml',
				// tool.mypy: allow_subclassing_any; tool.poetry: package-mode; tool.ruff: show-fixes
				'neo4j-field-ps-genai-agents.pyproject.toml',
				// tool.pytest: doctest_optionflags; root-level: isort
				'njunlp-moe-lpr.pyproject.toml',
				// unknown tool: uv-dynamic-versioning
				'omniagentpay-omniagentpay.pyproject.toml',
				// build-system: include-package-data
				'omsf-openpharmmdflow.pyproject.toml',
				// unknown tool: dagster
				'open-model-initiative-graphcap.pyproject.toml',
				// project: python, homepage, repository, documentation; tool.isort: known_django; unknown tools: curlylint, djlint, codereviewdoctor
				'pack144-packman.pyproject.toml',
				// tool.isort: known_pelican, known_firstparty
				'pelican-plugins-nojekyll.pyproject.toml',
				// tool.mypy: allow_redefinition, disable_error_code; tool.poetry: build
				'pwwang-pipen-diagram.pyproject.toml',
				// project: repository, homepage; unknown tools: semantic_release, pyrefly; root-level: semantic_release
				'pythonhubdev-scaffoldr.pyproject.toml',
				// tool.pylint: main, basic, classes
				'quick-invoice-api-invoice-utils.pyproject.toml',
				// project: packages
				'runekaagaard-mcp-redmine.pyproject.toml',
				// tool.ruff: builtins; unknown tool: build_sphinx
				'salt-extensions-saltext-github.pyproject.toml',
				// tool.pytest: doctest_optionflags; root-level: isort
				'saltychtao-moe-lpr.pyproject.toml',
				// tool.poetry: package-mode
				'snipy7374-code-jam-24-universes.pyproject.toml',
				// tool.pytest: doctest_optionflags; root-level: isort
				'thunlp-loraflow.pyproject.toml',
				// tool.pytest: ini_option (typo); root-level: mypy
				'timgrob-crypto-warren.pyproject.toml',
				// tool.ruff: include
				'tu-wien-datalab-grader-labextension.pyproject.toml',
				// tool.mypy: strict_concatenate
				'ualbertafsae-f1tenth.pyproject.toml',
				// project: url, license_files
				'uhlive-python-sdk.pyproject.toml',
				// tool.pytest: doctest_optionflags; root-level: isort
				'vityavitalich-llm-compression.pyproject.toml',
				// tool.black: target_version
				'vladvasiliu-kibana-prometheus-exporter-py.pyproject.toml',
				// unknown tool: coverage_rich
				'waylonwalker-coverage-rich.pyproject.toml',
				// unknown tool: comfy
				'zentrocdot-comfyui-simple-image-to-prompt.pyproject.toml',
			])

			const files = await fs.readdir(fixturesDirectory)
			const tomlFiles = files.filter((f) => f.endsWith('.toml') && !errorBlacklist.has(f))
			expect(tomlFiles.length).toBeGreaterThan(250)

			const errors: Array<{ error: string; file: string }> = []

			await Promise.all(
				tomlFiles.map(async (file) => {
					try {
						await readPyproject(path.join(fixturesDirectory, file), 'error')
					} catch (error) {
						errors.push({
							error: error instanceof Error ? error.message : String(error),
							file,
						})
					}
				}),
			)

			if (errors.length > 0) {
				const summary = errors
					.slice(0, 10)
					.map((entry) => `  ${entry.file}: ${entry.error.split('\n')[0]}`)
					.join('\n')
				throw new Error(
					`${String(errors.length)}/${String(tomlFiles.length)} fixtures failed error-level validation:\n${summary}`,
				)
			}
		},
	)
})
