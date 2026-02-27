import fs from 'node:fs/promises'
import path from 'node:path'
import { parse } from 'smol-toml'
import type { PyprojectData, RawPyprojectData, UnknownKeyPolicy } from './types'
import { deepCamelCaseKeys } from './camel-case'
import { PyprojectError } from './error'
import { log } from './log'
import { createPyprojectSchema } from './schema/pyproject'

export type ReadPyprojectOptions = {
	camelCase?: boolean
	unknownKeyPolicy?: UnknownKeyPolicy
}

/**
 * Read, parse, validate, and normalize a pyproject.toml file.
 * @param pathOrDirectory - A file path or directory. If a directory (no extension), appends `/pyproject.toml`. Defaults to `process.cwd()`.
 * @param options - Options for parsing and key conversion.
 * @returns The parsed pyproject data, with keys in camelCase by default.
 */
export async function readPyproject(
	pathOrDirectory?: string,
	options?: ReadPyprojectOptions & { camelCase?: true },
): Promise<PyprojectData>
export async function readPyproject(
	pathOrDirectory: string | undefined,
	options: ReadPyprojectOptions & { camelCase: false },
): Promise<RawPyprojectData>
export async function readPyproject(
	pathOrDirectory?: string,
	options: ReadPyprojectOptions = {},
): Promise<PyprojectData | RawPyprojectData> {
	const { camelCase: camelCaseKeys = true, unknownKeyPolicy = 'passthrough' } = options
	const filePath = await resolveFilePath(pathOrDirectory ?? process.cwd())

	log.debug(`Reading pyproject.toml from ${filePath}`)

	let content: string
	try {
		content = await fs.readFile(filePath, 'utf8')
	} catch (error) {
		throw new PyprojectError(`Could not read file: ${filePath}`, {
			cause: error instanceof Error ? error : new Error(String(error)),
			filePath,
		})
	}

	let parsed: Record<string, unknown>
	try {
		parsed = parse(content)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		throw new PyprojectError(`Invalid TOML in ${filePath}: ${message}`, {
			cause: error instanceof Error ? error : new Error(String(error)),
			filePath,
		})
	}

	const schema = createPyprojectSchema(unknownKeyPolicy)

	let result: ReturnType<typeof schema.safeParse>
	try {
		result = schema.safeParse(parsed)
	} catch (error) {
		if (error instanceof PyprojectError) {
			error.filePath ??= filePath
			throw error
		}

		throw new PyprojectError(
			`Validation failed for ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
			{
				cause: error instanceof Error ? error : new Error(String(error)),
				filePath,
			},
		)
	}

	if (!result.success) {
		const issues = result.error.issues
			.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
			.join('\n')
		throw new PyprojectError(`Validation failed for ${filePath}:\n${issues}`, {
			cause: result.error,
			filePath,
		})
	}

	if (camelCaseKeys) {
		// eslint-disable-next-line ts/no-unsafe-type-assertion -- overload guarantees PyprojectData
		return deepCamelCaseKeys(result.data) as PyprojectData
	}

	return result.data
}

async function resolveFilePath(input: string): Promise<string> {
	const resolved = path.resolve(input)
	try {
		const stat = await fs.stat(resolved)
		if (stat.isDirectory()) {
			return path.join(resolved, 'pyproject.toml')
		}
	} catch {
		// Path doesn't exist yet — pass through and let readFile handle the error
	}

	return resolved
}
