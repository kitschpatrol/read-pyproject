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
	it('keeps string "README.md" as a string', () => {
		const schema = createProjectSchema('passthrough')
		const result = schema.parse({ name: 'test', readme: 'README.md' })
		expect(result.readme).toBe('README.md')
	})

	it('keeps string "README.rst" as a string', () => {
		const schema = createProjectSchema('passthrough')
		const result = schema.parse({ name: 'test', readme: 'README.rst' })
		expect(result.readme).toBe('README.rst')
	})

	it('collapses table with file to a string', () => {
		const schema = createProjectSchema('passthrough')
		const result = schema.parse({
			name: 'test',
			readme: { 'content-type': 'text/markdown', file: 'README.md' },
		})
		expect(result.readme).toBe('README.md')
	})

	it('normalizes table with text and content-type to object', () => {
		const schema = createProjectSchema('passthrough')
		const result = schema.parse({
			name: 'test',
			readme: { 'content-type': 'text/plain', text: 'Hello world' },
		})
		expect(result.readme).toEqual({ contentType: 'text/plain', text: 'Hello world' })
	})

	it('normalizes table with text only (no content-type)', () => {
		const schema = createProjectSchema('passthrough')
		const result = schema.parse({
			name: 'test',
			readme: { text: 'Hello world' },
		})
		expect(result.readme).toEqual({ text: 'Hello world' })
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

	it('passes through valid SPDX expressions', () => {
		expect(correctSpdx('GPL-3.0')).toBe('GPL-3.0')
	})

	it('corrects misspelled SPDX with spdx-correct', () => {
		expect(correctSpdx('GPLv3')).toBe('GPL-3.0-or-later')
	})

	it('throws for uncorrectable SPDX', () => {
		expect(() => correctSpdx('NOT-A-REAL-LICENSE-XYZ')).toThrow(PyprojectError)
	})
})

// ---------------------------------------------------------------------------
// camelCase conversion (via readPyproject with default camelCase: true)
// ---------------------------------------------------------------------------

describe('camelCase key conversion', () => {
	it('converts build-system keys via readPyproject', async () => {
		const temporaryDirectory = path.join(fixturesDirectory, '__tmp_camel_bs__')
		await fs.mkdir(temporaryDirectory, { recursive: true })
		await fs.writeFile(
			path.join(temporaryDirectory, 'pyproject.toml'),
			'[build-system]\nbuild-backend = "setuptools.build_meta"\nrequires = ["setuptools"]\nbackend-path = ["src"]\n',
		)
		try {
			const result = await readPyproject(temporaryDirectory)
			expect(result.buildSystem?.buildBackend).toBe('setuptools.build_meta')
			expect(result.buildSystem?.backendPath).toEqual(['src'])
		} finally {
			await fs.rm(temporaryDirectory, { recursive: true })
		}
	})

	it('converts project kebab-case keys via readPyproject', async () => {
		const temporaryDirectory = path.join(fixturesDirectory, '__tmp_camel_proj__')
		await fs.mkdir(temporaryDirectory, { recursive: true })
		await fs.writeFile(
			path.join(temporaryDirectory, 'pyproject.toml'),
			'[project]\nname = "test"\nrequires-python = ">=3.8"\n\n[project.optional-dependencies]\ndev = ["pytest"]\n',
		)
		try {
			const result = await readPyproject(temporaryDirectory)
			expect(result.project?.requiresPython).toBe('>=3.8')
			expect(result.project?.optionalDependencies).toEqual({ dev: ['pytest'] })
		} finally {
			await fs.rm(temporaryDirectory, { recursive: true })
		}
	})

	it('raw schemas output raw keys (no camelCase)', () => {
		const schema = createBuildSystemSchema('passthrough')
		const result = schema.parse({
			'backend-path': ['src'],
			'build-backend': 'setuptools.build_meta',
			requires: ['setuptools'],
		})
		expect(result['build-backend']).toBe('setuptools.build_meta')
		expect(result['backend-path']).toEqual(['src'])
	})

	it('raw schemas output raw project keys', () => {
		const schema = createProjectSchema('passthrough')
		const result = schema.parse({
			'entry-points': { group: { name: 'module:func' } },
			'gui-scripts': { app: 'app:main' },
			name: 'test',
			'optional-dependencies': { dev: ['pytest'] },
			'requires-python': '>=3.8',
		})
		expect(result['requires-python']).toBe('>=3.8')
		expect(result['optional-dependencies']).toEqual({ dev: ['pytest'] })
		expect(result['gui-scripts']).toEqual({ app: 'app:main' })
		expect(result['entry-points']).toEqual({ group: { name: 'module:func' } })
	})

	it('converts top-level build-system key via readPyproject', async () => {
		const temporaryDirectory = path.join(fixturesDirectory, '__tmp_camel_top__')
		await fs.mkdir(temporaryDirectory, { recursive: true })
		await fs.writeFile(
			path.join(temporaryDirectory, 'pyproject.toml'),
			'[build-system]\nbuild-backend = "setuptools.build_meta"\nrequires = ["setuptools"]\n',
		)
		try {
			const result = await readPyproject(temporaryDirectory)
			expect(result.buildSystem).toBeDefined()
			expect(result.buildSystem?.buildBackend).toBe('setuptools.build_meta')
		} finally {
			await fs.rm(temporaryDirectory, { recursive: true })
		}
	})
})

// ---------------------------------------------------------------------------
// camelCase: false mode (raw key output)
// ---------------------------------------------------------------------------

describe('camelCase: false mode', () => {
	it('returns raw keys when camelCase is false', async () => {
		const temporaryDirectory = path.join(fixturesDirectory, '__tmp_raw_mode__')
		await fs.mkdir(temporaryDirectory, { recursive: true })
		await fs.writeFile(
			path.join(temporaryDirectory, 'pyproject.toml'),
			'[build-system]\nbuild-backend = "setuptools.build_meta"\nrequires = ["setuptools"]\n\n[project]\nname = "test"\nrequires-python = ">=3.8"\n',
		)
		try {
			const result = await readPyproject(temporaryDirectory, { camelCase: false })
			expect(result['build-system']?.['build-backend']).toBe('setuptools.build_meta')
			expect(result.project?.['requires-python']).toBe('>=3.8')
			expect(result.project?.name).toBe('test')
		} finally {
			await fs.rm(temporaryDirectory, { recursive: true })
		}
	})

	it('preserves raw dependency-groups key when camelCase is false', async () => {
		const temporaryDirectory = path.join(fixturesDirectory, '__tmp_raw_depgroups__')
		await fs.mkdir(temporaryDirectory, { recursive: true })
		await fs.writeFile(
			path.join(temporaryDirectory, 'pyproject.toml'),
			'[dependency-groups]\ndev = ["pytest"]\n',
		)
		try {
			const result = await readPyproject(temporaryDirectory, { camelCase: false })
			expect(result['dependency-groups']).toEqual({ dev: ['pytest'] })
		} finally {
			await fs.rm(temporaryDirectory, { recursive: true })
		}
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
		expect(result['dependency-groups']).toEqual({
			dev: ['pytest>=7', 'coverage'],
			docs: ['sphinx'],
		})
	})

	it('parses include-group references', () => {
		const schema = createPyprojectSchema('passthrough')
		const result = schema.parse({
			'dependency-groups': {
				test: ['pytest>7'],
				'typing-test': [{ 'include-group': 'typing' }, { 'include-group': 'test' }, 'useful-types'],
			},
		})
		expect(result['dependency-groups']?.['typing-test']).toEqual([
			{ 'include-group': 'typing' },
			{ 'include-group': 'test' },
			'useful-types',
		])
	})

	it('keeps raw dependency-groups key in schema output', () => {
		const schema = createPyprojectSchema('passthrough')
		const result = schema.parse({
			'dependency-groups': { dev: ['ruff'] },
		})
		expect(result['dependency-groups']).toBeDefined()
	})
})

// ---------------------------------------------------------------------------
// Error cases
// ---------------------------------------------------------------------------

describe('unknownKeyPolicy modes', () => {
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

	it('unknownKeyPolicy works via options object', async () => {
		const temporaryDirectory = path.join(fixturesDirectory, '__tmp_opts_ukp__')
		await fs.mkdir(temporaryDirectory, { recursive: true })
		await fs.writeFile(
			path.join(temporaryDirectory, 'pyproject.toml'),
			'[project]\nname = "test"\nunknown-key = "value"\n',
		)
		try {
			await expect(
				readPyproject(temporaryDirectory, { unknownKeyPolicy: 'error' }),
			).rejects.toThrow(PyprojectError)
		} finally {
			await fs.rm(temporaryDirectory, { recursive: true })
		}
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

	it('parses all fixture files with camelCase: false', { timeout: 60_000 }, async () => {
		const files = await fs.readdir(fixturesDirectory)
		const tomlFiles = files.filter((f) => f.endsWith('.toml'))
		expect(tomlFiles.length).toBeGreaterThan(300)

		const errors: Array<{ error: string; file: string }> = []

		await Promise.all(
			tomlFiles.map(async (file) => {
				try {
					await readPyproject(path.join(fixturesDirectory, file), { camelCase: false })
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
				`${String(errors.length)}/${String(tomlFiles.length)} fixtures failed (camelCase: false):\n${summary}`,
			)
		}
	})

	it(
		'parses non-blacklisted fixture files with error-level unknownKeyPolicy',
		{ timeout: 60_000 },
		async () => {
			// Fixtures that fail error-level validation.
			// Each entry is commented with the unrecognized keys / unknown tools causing the failure.
			const errorBlacklist = new Set([
				// unknown tool: crewai
				'agenticfsu-quantbot.pyproject.toml',
				// unknown tool: oxt
				'amourspirit-libreoffice-python-path-ext.pyproject.toml',
				// unknown tools: doc8, nbqa, poetry_bumpversion, poetry-sort
				'appliedai-gmbh-armscan-env.pyproject.toml',
				// unknown tool: kedro
				'bartoszzolkiewski-asi.pyproject.toml',
				// unknown tool: codeflash
				'bbelderbos-code-quality.pyproject.toml',
				// unknown tool: check-manifest
				'brisvag-waretomo.pyproject.toml',
				// unknown tool: flakeheaven
				'craigtrim-lingpatlab.pyproject.toml',
				// unknown tool: uv_build
				'douile-friends-queue.pyproject.toml',
				// unknown tool: chango
				'eatsky1006-python-telegram-bot.pyproject.toml',
				// unknown tool: bumpver
				'gardenerik-django-policies.pyproject.toml',
				// unknown tool: dephell
				'ig248-tensorpandas.pyproject.toml',
				// unknown tool: scikit-build
				'iitpvisionlab-adrt.pyproject.toml',
				// unknown tool: poetry-dynamic-versioning
				'kaisbn-openly.pyproject.toml',
				// unknown tool: pydantic-mypy
				'lucas-six-python-cookbook.pyproject.toml',
				// unknown tool: uv-dynamic-versioning
				'omniagentpay-omniagentpay.pyproject.toml',
				// unknown tool: build_sphinx
				'salt-extensions-saltext-github.pyproject.toml',
				// unknown tool: coverage_rich
				'waylonwalker-coverage-rich.pyproject.toml',
			])

			const files = await fs.readdir(fixturesDirectory)
			const tomlFiles = files.filter((f) => f.endsWith('.toml') && !errorBlacklist.has(f))
			expect(tomlFiles.length).toBeGreaterThan(250)

			const errors: Array<{ error: string; file: string }> = []

			await Promise.all(
				tomlFiles.map(async (file) => {
					try {
						await readPyproject(path.join(fixturesDirectory, file), {
							unknownKeyPolicy: 'error',
						})
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
