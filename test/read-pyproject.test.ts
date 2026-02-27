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
	createBumpversionSchema,
	createCodespellSchema,
	createCommitizenSchema,
	createCoverageSchema,
	createDocformatterSchema,
	createFlake8Schema,
	createIsortSchema,
	createMypySchema,
	createPoeSchema,
	createPoetrySchema,
	createPyrightSchema,
	createPytestSchema,
	createRuffSchema,
	createSetuptoolsScmSchema,
	createTowncrierSchema,
	createUvSchema,
	createYapfSchema,
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
// Tool schemas
// ---------------------------------------------------------------------------

describe('tool schemas', () => {
	it('parses poe config', () => {
		const schema = createPoeSchema('passthrough')
		const result = schema.parse({
			'default-task-type': 'cmd',
			// eslint-disable-next-line ts/naming-convention
			env: { NODE_ENV: 'test' },
			executor: { type: 'poetry' },
			'poetry-command': 'poe',
			'shell-interpreter': 'bash',
			tasks: {
				format: { cmd: 'black app', help: 'Run black on the code base' },
				lint: 'ruff check .',
				test: ['lint', 'unit-test'],
			},
			verbosity: 1,
		})
		expect(result.defaultTaskType).toBe('cmd')
		// eslint-disable-next-line ts/naming-convention
		expect(result.env).toEqual({ NODE_ENV: 'test' })
		expect(result.executor).toEqual({ type: 'poetry' })
		expect(result.poetryCommand).toBe('poe')
		expect(result.shellInterpreter).toBe('bash')
		expect(result.verbosity).toBe(1)
		expect(result.tasks).toEqual({
			format: { cmd: 'black app', help: 'Run black on the code base' },
			lint: 'ruff check .',
			test: ['lint', 'unit-test'],
		})
	})

	it('parses poetry config', () => {
		const schema = createPoetrySchema('passthrough')
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
		const schema = createRuffSchema('passthrough')
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
		const schema = createMypySchema('passthrough')
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
		const schema = createPytestSchema('passthrough')
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
		const schema = createBlackSchema('passthrough')
		const result = schema.parse({
			'line-length': 88,
			preview: true,
			'target-version': ['py38', 'py39'],
		})
		expect(result.lineLength).toBe(88)
		expect(result.targetVersion).toEqual(['py38', 'py39'])
	})

	it('parses uv config', () => {
		const schema = createUvSchema('passthrough')
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
		const schema = createIsortSchema('passthrough')
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
		const schema = createCoverageSchema('passthrough')
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
		const schema = createPyrightSchema('passthrough')
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
		const schema = createSetuptoolsScmSchema('passthrough')
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

	it('parses codespell config', () => {
		const schema = createCodespellSchema('passthrough')
		const result = schema.parse({
			'check-filenames': true,
			'ignore-words-list': 'crate,nd,ned',
			'quiet-level': 3,
			skip: '*.pt,*.pth,.git',
		})
		expect(result.checkFilenames).toBe(true)
		expect(result.ignoreWordsList).toBe('crate,nd,ned')
		expect(result.quietLevel).toBe(3)
		expect(result.skip).toBe('*.pt,*.pth,.git')
	})

	it('parses yapf config', () => {
		const schema = createYapfSchema('passthrough')
		const result = schema.parse({
			// eslint-disable-next-line ts/naming-convention
			based_on_style: 'pep8',
			// eslint-disable-next-line ts/naming-convention
			coalesce_brackets: true,
			// eslint-disable-next-line ts/naming-convention
			column_limit: 120,
			// eslint-disable-next-line ts/naming-convention
			spaces_before_comment: 2,
			// eslint-disable-next-line ts/naming-convention
			split_before_closing_bracket: false,
			// eslint-disable-next-line ts/naming-convention
			split_before_first_argument: false,
		})
		expect(result.basedOnStyle).toBe('pep8')
		expect(result.columnLimit).toBe(120)
		expect(result.coalesceBrackets).toBe(true)
		expect(result.spacesBeforeComment).toBe(2)
		expect(result.splitBeforeClosingBracket).toBe(false)
		expect(result.splitBeforeFirstArgument).toBe(false)
	})

	it('parses flake8 config', () => {
		const schema = createFlake8Schema('passthrough')
		const result = schema.parse({
			exclude: ['.git', 'venv', 'build', 'dist'],
			'extend-ignore': ['E203', 'E501', 'W503'],
			'extend-select': ['B950'],
			ignore: ['E501'],
			'max-complexity': 30,
			'max-line-length': 120,
			select: ['E', 'F', 'W', 'C', 'B9'],
		})
		expect(result.maxLineLength).toBe(120)
		expect(result.maxComplexity).toBe(30)
		expect(result.exclude).toEqual(['.git', 'venv', 'build', 'dist'])
		expect(result.extendIgnore).toEqual(['E203', 'E501', 'W503'])
		expect(result.extendSelect).toEqual(['B950'])
		expect(result.ignore).toEqual(['E501'])
		expect(result.select).toEqual(['E', 'F', 'W', 'C', 'B9'])
	})

	it('parses towncrier config', () => {
		const schema = createTowncrierSchema('passthrough')
		const result = schema.parse({
			directory: 'changelog.d',
			filename: 'CHANGELOG.md',
			// eslint-disable-next-line ts/naming-convention
			issue_format: '#{issue}',
			package: 'my-project',
			// eslint-disable-next-line ts/naming-convention
			package_dir: 'src',
			// eslint-disable-next-line ts/naming-convention
			start_string: '<!-- towncrier release notes start -->',
			template: 'changelog.d/_template.md',
			// eslint-disable-next-line ts/naming-convention
			title_format: '## {version} ({project_date})',
			type: [
				{ directory: 'added', name: 'Added', showcontent: true },
				{ directory: 'fixed', name: 'Fixed', showcontent: true },
			],
			underlines: ['', '', ''],
		})
		expect(result.package).toBe('my-project')
		expect(result.packageDirectory).toBe('src')
		expect(result.directory).toBe('changelog.d')
		expect(result.filename).toBe('CHANGELOG.md')
		expect(result.issueFormat).toBe('#{issue}')
		expect(result.startString).toBe('<!-- towncrier release notes start -->')
		expect(result.titleFormat).toBe('## {version} ({project_date})')
		expect(result.type).toEqual([
			{ directory: 'added', name: 'Added', showcontent: true },
			{ directory: 'fixed', name: 'Fixed', showcontent: true },
		])
		expect(result.underlines).toEqual(['', '', ''])
	})

	it('parses docformatter config', () => {
		const schema = createDocformatterSchema('passthrough')
		const result = schema.parse({
			'close-quotes-on-newline': true,
			'in-place': true,
			'pre-summary-newline': true,
			'wrap-descriptions': 120,
			'wrap-summaries': 120,
		})
		expect(result.wrapSummaries).toBe(120)
		expect(result.wrapDescriptions).toBe(120)
		expect(result.preSummaryNewline).toBe(true)
		expect(result.closeQuotesOnNewline).toBe(true)
		expect(result.inPlace).toBe(true)
	})

	it('parses bumpversion config', () => {
		const schema = createBumpversionSchema('passthrough')
		const result = schema.parse({
			// eslint-disable-next-line ts/naming-convention
			allow_dirty: false,
			commit: true,
			// eslint-disable-next-line ts/naming-convention
			current_version: '1.2.3',
			files: [{ filename: 'setup.py' }, { glob: 'src/**/*.py', regex: true }],
			message: 'Release: {new_version}',
			// eslint-disable-next-line ts/naming-convention
			post_commit_hooks: ['git push', 'git push --tags'],
			// eslint-disable-next-line ts/naming-convention
			pre_commit_hooks: ['uv sync', 'git add uv.lock'],
			// eslint-disable-next-line ts/naming-convention
			sign_tags: false,
			tag: true,
			// eslint-disable-next-line ts/naming-convention
			tag_message: 'Release: {new_version}',
			// eslint-disable-next-line ts/naming-convention
			tag_name: 'v{new_version}',
		})
		expect(result.allowDirty).toBe(false)
		expect(result.commit).toBe(true)
		expect(result.currentVersion).toBe('1.2.3')
		expect(result.message).toBe('Release: {new_version}')
		expect(result.tag).toBe(true)
		expect(result.tagName).toBe('v{new_version}')
		expect(result.tagMessage).toBe('Release: {new_version}')
		expect(result.signTags).toBe(false)
		expect(result.preCommitHooks).toEqual(['uv sync', 'git add uv.lock'])
		expect(result.postCommitHooks).toEqual(['git push', 'git push --tags'])
		expect(result.files).toEqual([{ filename: 'setup.py' }, { glob: 'src/**/*.py', regex: true }])
	})

	it('parses commitizen config', () => {
		const schema = createCommitizenSchema('passthrough')
		const result = schema.parse({
			// eslint-disable-next-line ts/naming-convention
			major_version_zero: false,
			name: 'cz_conventional_commits',
			// eslint-disable-next-line ts/naming-convention
			tag_format: 'v$version',
			// eslint-disable-next-line ts/naming-convention
			update_changelog_on_bump: true,
			version: '1.0.0',
			// eslint-disable-next-line ts/naming-convention
			version_files: ['pyproject.toml:version', 'src/pkg/version.py'],
			// eslint-disable-next-line ts/naming-convention
			version_provider: 'poetry',
			// eslint-disable-next-line ts/naming-convention
			version_scheme: 'pep440',
		})
		expect(result.name).toBe('cz_conventional_commits')
		expect(result.version).toBe('1.0.0')
		expect(result.tagFormat).toBe('v$version')
		expect(result.versionScheme).toBe('pep440')
		expect(result.versionProvider).toBe('poetry')
		expect(result.versionFiles).toEqual(['pyproject.toml:version', 'src/pkg/version.py'])
		expect(result.updateChangelogOnBump).toBe(true)
		expect(result.majorVersionZero).toBe(false)
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
})
