import { describe, expect, it } from 'vitest'
import {
	createAutopep8Schema,
	createBanditSchema,
	createBlackSchema,
	createBumpversionSchema,
	createCheckWheelContentsSchema,
	createCibuildwheelSchema,
	createCodespellSchema,
	createCommitizenSchema,
	createCoverageSchema,
	createDistutilsSchema,
	createDocformatterSchema,
	createFlake8Schema,
	createFlitSchema,
	createIsortSchema,
	createJupyterReleaserSchema,
	createMypySchema,
	createPoeSchema,
	createPoetrySchema,
	createPylintSchema,
	createPyrightSchema,
	createPytestSchema,
	createRuffSchema,
	createSetuptoolsScmSchema,
	createTbumpSchema,
	createTowncrierSchema,
	createUvSchema,
	createYapfSchema,
} from '../src/schema/tool'

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

	it('parses flit config', () => {
		const schema = createFlitSchema('passthrough')
		const result = schema.parse({
			module: { name: 'mypackage' },
			sdist: {
				exclude: [],
				include: ['CHANGELOG.md', 'README.md', '*/test*.py'],
			},
		})
		expect(result.module?.name).toBe('mypackage')
		expect(result.sdist?.include).toEqual(['CHANGELOG.md', 'README.md', '*/test*.py'])
		expect(result.sdist?.exclude).toEqual([])
	})

	it('parses autopep8 config', () => {
		const schema = createAutopep8Schema('passthrough')
		const result = schema.parse({
			aggressive: 2,
			// eslint-disable-next-line ts/naming-convention
			max_line_length: 120,
		})
		expect(result.maxLineLength).toBe(120)
		expect(result.aggressive).toBe(2)
	})

	it('parses bandit config', () => {
		const schema = createBanditSchema('passthrough')
		const result = schema.parse({
			// eslint-disable-next-line ts/naming-convention
			exclude_dirs: ['tests', 'examples'],
			skips: ['B101', 'B601'],
			tests: ['B201'],
		})
		expect(result.excludeDirectories).toEqual(['tests', 'examples'])
		expect(result.skips).toEqual(['B101', 'B601'])
		expect(result.tests).toEqual(['B201'])
	})

	it('parses cibuildwheel config', () => {
		const schema = createCibuildwheelSchema('passthrough')
		const result = schema.parse({
			build: 'cp310-*',
			'build-frontend': 'build',
			skip: '*-musllinux*',
			'test-command': 'pytest {project}/tests',
			'test-requires': 'pytest',
		})
		expect(result.build).toBe('cp310-*')
		expect(result.buildFrontend).toBe('build')
		expect(result.skip).toBe('*-musllinux*')
		expect(result.testCommand).toBe('pytest {project}/tests')
		expect(result.testRequires).toBe('pytest')
	})

	it('parses tbump config', () => {
		const schema = createTbumpSchema('passthrough')
		const result = schema.parse({
			file: [{ search: '"version": "{current_version}"', src: 'package.json' }],
			git: {
				// eslint-disable-next-line ts/naming-convention
				message_template: 'Bump to {new_version}',
				// eslint-disable-next-line ts/naming-convention
				tag_template: 'v{new_version}',
			},
			// eslint-disable-next-line ts/naming-convention
			github_url: 'https://github.com/example/repo/',
			version: {
				current: '1.0.0',
				regex: String.raw`(?P<major>\d+)\.(?P<minor>\d+)\.(?P<patch>\d+)`,
			},
		})
		expect(result.githubUrl).toBe('https://github.com/example/repo/')
		expect(result.version?.current).toBe('1.0.0')
		expect(result.git?.messageTemplate).toBe('Bump to {new_version}')
		expect(result.git?.tagTemplate).toBe('v{new_version}')
		expect(result.file).toEqual([{ search: '"version": "{current_version}"', src: 'package.json' }])
	})

	it('parses distutils config', () => {
		const schema = createDistutilsSchema('passthrough')
		const result = schema.parse({
			// eslint-disable-next-line ts/naming-convention
			bdist_wheel: {
				// eslint-disable-next-line ts/naming-convention
				python_tag: 'py3',
				universal: true,
			},
			sdist: { group: 'root', owner: 'root' },
		})
		expect(result.bdistWheel?.universal).toBe(true)
		expect(result.bdistWheel?.pythonTag).toBe('py3')
		expect(result.sdist).toEqual({ group: 'root', owner: 'root' })
	})

	it('parses check-wheel-contents config', () => {
		const schema = createCheckWheelContentsSchema('passthrough')
		const result = schema.parse({
			ignore: ['W002'],
		})
		expect(result.ignore).toEqual(['W002'])
	})

	it('parses jupyter-releaser config', () => {
		const schema = createJupyterReleaserSchema('passthrough')
		const result = schema.parse({
			hooks: {
				'before-build-npm': [
					"python -m pip install 'jupyterlab>=4.0.0,<5'",
					'jlpm',
					'jlpm build:prod',
				],
				'before-build-python': ['jlpm clean:all'],
			},
			options: {
				// eslint-disable-next-line ts/naming-convention
				version_cmd: 'hatch version',
			},
		})
		expect(result.hooks?.beforeBuildNpm).toEqual([
			"python -m pip install 'jupyterlab>=4.0.0,<5'",
			'jlpm',
			'jlpm build:prod',
		])
		expect(result.hooks?.beforeBuildPython).toEqual(['jlpm clean:all'])
	})

	it('parses pylint config', () => {
		const schema = createPylintSchema('passthrough')
		const result = schema.parse({
			disable: ['missing-docstring', 'too-few-public-methods'],
			'good-names': ['i', 'j', 'k', 'x'],
			jobs: 0,
			'load-plugins': ['pylint.extensions.mccabe'],
			'max-line-length': 120,
		})
		expect(result.goodNames).toEqual(['i', 'j', 'k', 'x'])
		expect(result.jobs).toBe(0)
		expect(result.loadPlugins).toEqual(['pylint.extensions.mccabe'])
		expect(result.maxLineLength).toBe(120)
		expect(result.disable).toEqual(['missing-docstring', 'too-few-public-methods'])
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
