import fs from 'node:fs/promises'
import path from 'node:path'
import type { PyprojectData, PyprojectOptions, RawPyprojectData } from './types'
import { PyprojectError } from './error'
import { log } from './log'
import { parsePyproject } from './parser'

/**
 * Read, parse, validate, and normalize a pyproject.toml file.
 * @param pathOrDirectory - A file path or directory. If a directory (no extension), appends `/pyproject.toml`. Defaults to `process.cwd()`.
 * @param options - Options for parsing and key conversion.
 * @returns The parsed pyproject data, with keys in camelCase by default.
 */
export async function readPyproject(
	pathOrDirectory?: string,
	options?: PyprojectOptions & { camelCase?: true },
): Promise<PyprojectData>
export async function readPyproject(
	pathOrDirectory: string | undefined,
	options: PyprojectOptions & { camelCase: false },
): Promise<RawPyprojectData>
export async function readPyproject(
	pathOrDirectory?: string,
	options: PyprojectOptions = {},
): Promise<PyprojectData | RawPyprojectData> {
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

	try {
		// eslint-disable-next-line ts/no-unsafe-type-assertion -- overloads on readPyproject already constrain the return type
		return parsePyproject(content, options as PyprojectOptions & { camelCase?: true })
	} catch (error) {
		if (error instanceof PyprojectError) {
			error.filePath ??= filePath
			throw error
		}

		throw error
	}
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
