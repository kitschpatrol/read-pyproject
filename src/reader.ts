import fs from 'node:fs/promises'
import path from 'node:path'
import { parse } from 'smol-toml'
import type { PyprojectData } from './types'
import { PyprojectError } from './error'
import { log } from './log'
import { createPyprojectSchema } from './schema/pyproject'

export type ReadPyprojectOptions = {
	/** Working directory to resolve pyproject.toml from. Defaults to `process.cwd()`. */
	cwd?: string
	/** Reject unknown keys in known sections. Defaults to `false`. */
	strict?: boolean
}

export async function readPyproject(path: string): Promise<PyprojectData>
export async function readPyproject(options?: ReadPyprojectOptions): Promise<PyprojectData>
/**
 * Read, parse, validate, and normalize a pyproject.toml file.
 */
export async function readPyproject(
	pathOrOptions?: ReadPyprojectOptions | string,
): Promise<PyprojectData> {
	const { filePath, strict } = resolveArgs(pathOrOptions)

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

	const schema = createPyprojectSchema(strict)
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

function resolveArgs(pathOrOptions?: ReadPyprojectOptions | string): {
	filePath: string
	strict: boolean
} {
	if (typeof pathOrOptions === 'string') {
		return {
			filePath: resolveFilePath(pathOrOptions),
			strict: false,
		}
	}

	const options = pathOrOptions ?? {}
	const cwd = options.cwd ?? process.cwd()
	return {
		filePath: path.resolve(cwd, 'pyproject.toml'),
		strict: options.strict ?? false,
	}
}

function resolveFilePath(input: string): string {
	const resolved = path.resolve(input)
	// If it looks like a directory (no extension), append pyproject.toml
	if (!path.extname(resolved)) {
		return path.join(resolved, 'pyproject.toml')
	}

	return resolved
}
