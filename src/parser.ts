import { parse } from 'smol-toml'
import type { PyprojectData, PyprojectOptions, RawPyprojectData } from './types'
import { deepCamelCaseKeys } from './camel-case'
import { PyprojectError } from './error'
import { createPyprojectSchema } from './schema/pyproject'

/**
 * Parse, validate, and normalize a pyproject.toml content string.
 * @param content - The TOML content string to parse.
 * @param options - Options for parsing and key conversion.
 * @returns The parsed pyproject data, with keys in camelCase by default.
 */
export function parsePyproject(
	content: string,
	options?: PyprojectOptions & { camelCase?: true },
): PyprojectData
export function parsePyproject(
	content: string,
	options: PyprojectOptions & { camelCase: false },
): RawPyprojectData
export function parsePyproject(
	content: string,
	options: PyprojectOptions = {},
): PyprojectData | RawPyprojectData {
	const { camelCase: camelCaseKeys = true, unknownKeyPolicy = 'passthrough' } = options

	let parsed: Record<string, unknown>
	try {
		parsed = parse(content)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		throw new PyprojectError(`Invalid TOML: ${message}`, {
			cause: error instanceof Error ? error : new Error(String(error)),
		})
	}

	const schema = createPyprojectSchema(unknownKeyPolicy)

	let result: ReturnType<typeof schema.safeParse>
	try {
		result = schema.safeParse(parsed)
	} catch (error) {
		if (error instanceof PyprojectError) {
			throw error
		}

		throw new PyprojectError(
			`Validation failed: ${error instanceof Error ? error.message : String(error)}`,
			{
				cause: error instanceof Error ? error : new Error(String(error)),
			},
		)
	}

	if (!result.success) {
		const issues = result.error.issues
			.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
			.join('\n')
		throw new PyprojectError(`Validation failed:\n${issues}`, {
			cause: result.error,
		})
	}

	if (camelCaseKeys) {
		// eslint-disable-next-line ts/no-unsafe-type-assertion -- overload guarantees PyprojectData
		return deepCamelCaseKeys(result.data) as PyprojectData
	}

	return result.data
}
