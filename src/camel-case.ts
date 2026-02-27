/**
 * Paths where values are records with user-defined keys (package names,
 * file paths, etc.) — the conversion function must not recurse into these.
 * Paths use camelCase key names because the function converts each key
 * before building the path.
 */
const RECORD_PATHS = new Set([
	'dependencyGroups',
	'project.entryPoints',
	'project.guiScripts',
	'project.optionalDependencies',
	'project.scripts',
	'project.urls',
	'tool.cibuildwheel.environment',
	'tool.coverage.paths',
	'tool.hatch.envs',
	'tool.pdm.devDependencies',
	'tool.pixi.dependencies',
	'tool.pixi.environments',
	'tool.pixi.feature',
	'tool.pixi.pypiDependencies',
	'tool.pixi.tasks',
	'tool.poe.env',
	'tool.poe.poetryHooks',
	'tool.poe.tasks',
	'tool.poetry.dependencies',
	'tool.poetry.devDependencies',
	'tool.poetry.extras',
	'tool.poetry.group',
	'tool.poetry.plugins',
	'tool.poetry.scripts',
	'tool.poetry.urls',
	'tool.pyright.defineConstant',
	'tool.ruff.lint.perFileIgnores',
	'tool.ruff.perFileIgnores',
	'tool.setuptools.packageData',
	'tool.setuptools.packageDir',
	'tool.uv.extraBuildDependencies',
	'tool.uv.sources',
])

/**
 * Convert a single key from kebab-case, snake_case, or PascalCase to camelCase.
 */
function toCamelCase(text: string): string {
	let result = text.replaceAll(/[-_]([a-z])/g, (_, c: string) => c.toUpperCase())
	if (/^[A-Z]/.test(result)) {
		result = result[0].toLowerCase() + result.slice(1)
	}

	return result
}

/**
 * Recursively convert object keys to camelCase, skipping paths in RECORD_PATHS
 * where values are user-defined records.
 */
export function deepCamelCaseKeys(object: unknown, path = ''): unknown {
	if (Array.isArray(object)) {
		return object.map((item) => deepCamelCaseKeys(item, path))
	}

	if (object !== null && typeof object === 'object') {
		const result: Record<string, unknown> = {}
		for (const [key, value] of Object.entries(object)) {
			const camelKey = toCamelCase(key)
			const newPath = path ? `${path}.${camelKey}` : camelKey
			result[camelKey] = RECORD_PATHS.has(newPath) ? value : deepCamelCaseKeys(value, newPath)
		}

		return result
	}

	return object
}
