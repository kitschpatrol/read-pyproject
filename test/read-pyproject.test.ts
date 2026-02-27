import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { PyprojectError, readPyproject } from '../src'
import { correctSpdx, normalizePep503Name } from '../src/normalize'
import { createBuildSystemSchema } from '../src/schema/build-system'
import { createProjectSchema } from '../src/schema/project'
import { createPyprojectSchema } from '../src/schema/pyproject'
import {
	createBlackSchema,
	createCoverageSchema,
	createIsortSchema,
	createMypySchema,
	createPoetrySchema,
	createPyrightSchema,
	createPytestSchema,
	createRuffSchema,
	createSetuptoolsScmSchema,
	createUvSchema,
} from '../src/schema/tool'

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
		const schema = createProjectSchema(false)
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
		const schema = createProjectSchema(false)
		const result = schema.parse({ name: 'test', readme: 'README.md' })
		expect(result.readme).toEqual({ contentType: 'text/markdown', file: 'README.md' })
	})

	it('normalizes string "README.rst" to object with contentType', () => {
		const schema = createProjectSchema(false)
		const result = schema.parse({ name: 'test', readme: 'README.rst' })
		expect(result.readme).toEqual({ contentType: 'text/x-rst', file: 'README.rst' })
	})

	it('normalizes table with file and content-type', () => {
		const schema = createProjectSchema(false)
		const result = schema.parse({
			name: 'test',
			readme: { 'content-type': 'text/markdown', file: 'README.md' },
		})
		expect(result.readme).toEqual({ contentType: 'text/markdown', file: 'README.md' })
	})

	it('normalizes table with text and content-type', () => {
		const schema = createProjectSchema(false)
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
		const schema = createProjectSchema(false)
		const result = schema.parse({ license: 'MIT', name: 'test' })
		expect(result.license).toEqual({ spdx: 'MIT' })
	})

	it('normalizes table {file: "LICENSE"} as-is', () => {
		const schema = createProjectSchema(false)
		const result = schema.parse({ license: { file: 'LICENSE' }, name: 'test' })
		expect(result.license).toEqual({ file: 'LICENSE' })
	})

	it('normalizes table {text: "..."} as-is', () => {
		const schema = createProjectSchema(false)
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
		const schema = createBuildSystemSchema(false)
		const result = schema.parse({
			'backend-path': ['src'],
			'build-backend': 'setuptools.build_meta',
			requires: ['setuptools'],
		})
		expect(result.buildBackend).toBe('setuptools.build_meta')
		expect(result.backendPath).toEqual(['src'])
	})

	it('converts project kebab-case keys', () => {
		const schema = createProjectSchema(false)
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
		const schema = createPyprojectSchema(false)
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
		const schema = createPyprojectSchema(false)
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
		const schema = createPyprojectSchema(false)
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
		const schema = createPyprojectSchema(false)
		const result = schema.parse({
			'dependency-groups': { dev: ['ruff'] },
		})
		expect(result.dependencyGroups).toBeDefined()
		expect('dependency-groups' in result).toBe(false)
	})
})

// ---------------------------------------------------------------------------
// Tool schemas
// ---------------------------------------------------------------------------

describe('tool schemas', () => {
	it('parses poetry config', () => {
		const schema = createPoetrySchema(false)
		const result = schema.parse({
			authors: ['Author <author@example.com>'],
			description: 'A project',
			'dev-dependencies': { pytest: '^7.0' },
			name: 'my-project',
			version: '1.0.0',
		})
		expect(result.name).toBe('my-project')
		expect(result.devDependencies).toEqual({ pytest: '^7.0' })
	})

	it('parses ruff config', () => {
		const schema = createRuffSchema(false)
		const result = schema.parse({
			format: { 'docstring-code-format': true, 'quote-style': 'double' },
			'line-length': 100,
			lint: { 'per-file-ignores': { '__init__.py': ['F401'] }, select: ['E', 'F'] },
			'target-version': 'py311',
		})
		expect(result.targetVersion).toBe('py311')
		expect(result.lineLength).toBe(100)
		expect(result.lint?.perFileIgnores).toEqual({ '__init__.py': ['F401'] })
		expect(result.format?.docstringCodeFormat).toBe(true)
	})

	it('parses mypy config', () => {
		const schema = createMypySchema(false)
		const result = schema.parse({
			// eslint-disable-next-line ts/naming-convention
			ignore_missing_imports: true,
			// eslint-disable-next-line ts/naming-convention
			python_version: '3.11',
			strict: true,
		})
		expect(result.pythonVersion).toBe('3.11')
		expect(result.strict).toBe(true)
		expect(result.ignoreMissingImports).toBe(true)
	})

	it('parses pytest config', () => {
		const schema = createPytestSchema(false)
		const result = schema.parse({
			// eslint-disable-next-line ts/naming-convention
			ini_options: {
				addopts: '-v --tb=short',
				// eslint-disable-next-line ts/naming-convention
				python_files: 'test_*.py',
				testpaths: ['tests'],
			},
		})
		expect(result.iniOptions?.addopts).toBe('-v --tb=short')
		expect(result.iniOptions?.pythonFiles).toBe('test_*.py')
	})

	it('parses black config', () => {
		const schema = createBlackSchema(false)
		const result = schema.parse({
			'line-length': 88,
			preview: true,
			'target-version': ['py38', 'py39'],
		})
		expect(result.lineLength).toBe(88)
		expect(result.targetVersion).toEqual(['py38', 'py39'])
	})

	it('parses uv config', () => {
		const schema = createUvSchema(false)
		const result = schema.parse({
			'dev-dependencies': ['pytest>=7.0'],
			'index-url': 'https://pypi.org/simple',
			// eslint-disable-next-line ts/naming-convention
			sources: { my_pkg: { path: './packages/my_pkg' } },
		})
		expect(result.devDependencies).toEqual(['pytest>=7.0'])
		expect(result.indexUrl).toBe('https://pypi.org/simple')
	})

	it('parses isort config', () => {
		const schema = createIsortSchema(false)
		const result = schema.parse({
			// eslint-disable-next-line ts/naming-convention
			force_single_line: true,
			// eslint-disable-next-line ts/naming-convention
			known_first_party: ['mypackage'],
			// eslint-disable-next-line ts/naming-convention
			line_length: 100,
			// eslint-disable-next-line ts/naming-convention
			multi_line_output: 3,
			profile: 'black',
			skip: ['__init__.py'],
			// eslint-disable-next-line ts/naming-convention
			src_paths: ['src', 'tests'],
		})
		expect(result.profile).toBe('black')
		expect(result.lineLength).toBe(100)
		expect(result.multiLineOutput).toBe(3)
		expect(result.forceSingleLine).toBe(true)
		expect(result.knownFirstParty).toEqual(['mypackage'])
		expect(result.srcPaths).toEqual(['src', 'tests'])
	})

	it('parses coverage config', () => {
		const schema = createCoverageSchema(false)
		const result = schema.parse({
			html: { directory: 'htmlcov' },
			paths: {
				source: ['src', '*/site-packages'],
				tests: ['tests', '*/tests'],
			},
			report: {
				// eslint-disable-next-line ts/naming-convention
				exclude_lines: ['pragma: no cover', 'if TYPE_CHECKING:'],
				// eslint-disable-next-line ts/naming-convention
				fail_under: 90,
				precision: 2,
				// eslint-disable-next-line ts/naming-convention
				show_missing: true,
				// eslint-disable-next-line ts/naming-convention
				skip_covered: true,
			},
			run: {
				branch: true,
				omit: ['*/tests/*'],
				parallel: true,
				source: ['mypackage'],
				// eslint-disable-next-line ts/naming-convention
				source_pkgs: ['mypackage'],
			},
		})
		expect(result.run?.branch).toBe(true)
		expect(result.run?.parallel).toBe(true)
		expect(result.run?.source).toEqual(['mypackage'])
		expect(result.run?.sourcePackages).toEqual(['mypackage'])
		expect(result.run?.omit).toEqual(['*/tests/*'])
		expect(result.report?.failUnder).toBe(90)
		expect(result.report?.showMissing).toBe(true)
		expect(result.report?.skipCovered).toBe(true)
		expect(result.report?.excludeLines).toEqual(['pragma: no cover', 'if TYPE_CHECKING:'])
		expect(result.report?.precision).toBe(2)
		expect(result.paths).toEqual({
			source: ['src', '*/site-packages'],
			tests: ['tests', '*/tests'],
		})
		expect(result.html?.directory).toBe('htmlcov')
	})

	it('parses pyright config', () => {
		const schema = createPyrightSchema(false)
		const result = schema.parse({
			exclude: ['**/__pycache__'],
			extraPaths: ['src'],
			include: ['src'],
			pythonPlatform: 'All',
			pythonVersion: '3.11',
			reportMissingImports: true,
			reportMissingTypeStubs: false,
			reportUnusedImport: 'warning',
			strictListInference: true,
			typeCheckingMode: 'strict',
			venv: '.venv',
			venvPath: '.',
		})
		expect(result.typeCheckingMode).toBe('strict')
		expect(result.pythonVersion).toBe('3.11')
		expect(result.pythonPlatform).toBe('All')
		expect(result.include).toEqual(['src'])
		expect(result.exclude).toEqual(['**/__pycache__'])
		expect(result.extraPaths).toEqual(['src'])
		expect(result.venvPath).toBe('.')
		expect(result.venv).toBe('.venv')
		expect(result.strictListInference).toBe(true)
		expect(result.reportMissingImports).toBe(true)
		expect(result.reportMissingTypeStubs).toBe(false)
		expect(result.reportUnusedImport).toBe('warning')
	})

	it('parses setuptools_scm config', () => {
		const schema = createSetuptoolsScmSchema(false)
		const result = schema.parse({
			// eslint-disable-next-line ts/naming-convention
			fallback_version: '0.0.0',
			root: '.',
			// eslint-disable-next-line ts/naming-convention
			version_file: 'src/mypackage/_version.py',
			// eslint-disable-next-line ts/naming-convention
			version_scheme: 'post-release',
			// eslint-disable-next-line ts/naming-convention
			write_to: 'src/mypackage/_version.py',
			// eslint-disable-next-line ts/naming-convention
			write_to_template: '__version__ = "{version}"',
		})
		expect(result.root).toBe('.')
		expect(result.fallbackVersion).toBe('0.0.0')
		expect(result.versionFile).toBe('src/mypackage/_version.py')
		expect(result.versionScheme).toBe('post-release')
		expect(result.writeTo).toBe('src/mypackage/_version.py')
		expect(result.writeToTemplate).toBe('__version__ = "{version}"')
	})
})

// ---------------------------------------------------------------------------
// Error cases
// ---------------------------------------------------------------------------

describe('error cases', () => {
	it('strict mode rejects unknown keys in project', () => {
		const schema = createProjectSchema(true)
		expect(() => schema.parse({ name: 'test', 'unknown-key': 'value' })).toThrow()
	})

	it('non-strict mode allows unknown keys in project', () => {
		const schema = createProjectSchema(false)
		const result = schema.parse({ name: 'test', 'unknown-key': 'value' })
		expect(result.name).toBe('test')
	})
})

// ---------------------------------------------------------------------------
// Unknown tool passthrough
// ---------------------------------------------------------------------------

describe('unknown tool passthrough', () => {
	it('passes through unknown tools as-is', () => {
		const schema = createPyprojectSchema(false)
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
})
