import fs from 'node:fs/promises'
import path from 'node:path'
import { parse } from 'smol-toml'
import type { PyprojectData, UnknownKeyPolicy } from './types'
import { PyprojectError } from './error'
import { log } from './log'
import { createPyprojectSchema } from './schema/pyproject'

/**
 * Read, parse, validate, and normalize a pyproject.toml file.
 * @param pathOrDirectory - A file path or directory. If a directory (no extension), appends `/pyproject.toml`. Defaults to `process.cwd()`.
 * @param unknownKeyPolicy - How to handle unknown keys: `'passthrough'` (default), `'strip'`, or `'error'`.
 */
export async function readPyproject(
	pathOrDirectory?: string,
	unknownKeyPolicy: UnknownKeyPolicy = 'passthrough',
): Promise<PyprojectData> {
	const filePath = await resolveFilePath(pathOrDirectory ?? process.cwd())

	log.info(`Reading pyproject.toml from ${filePath}`)

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
	const result = schema.safeParse(parsed)

	if (!result.success) {
		const issues = result.error.issues
			.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
			.join('\n')
		throw new PyprojectError(`Validation failed for ${filePath}:\n${issues}`, {
			cause: result.error,
			filePath,
		})
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
