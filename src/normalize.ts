import spdxCorrect from 'spdx-correct'
import spdxValidate from 'spdx-expression-validate'
import { PyprojectError } from './error'

/**
 * PEP 503 name normalization: lowercase, replace runs of [-_.] with a single hyphen.
 */
export function normalizePep503Name(name: string): string {
	return name.toLowerCase().replaceAll(/[-_.]+/g, '-')
}

export type NormalizedReadme =
	| { contentType?: string; file: string; text?: undefined }
	| { contentType?: string; file?: undefined; text: string }

export type NormalizedLicense =
	| { file: string; spdx?: undefined; text?: undefined }
	| { file?: undefined; spdx: string; text?: undefined }
	| { file?: undefined; spdx?: undefined; text: string }

/**
 * Validate and optionally correct an SPDX expression.
 */
export function correctSpdx(expression: string): string {
	if (spdxValidate(expression)) return expression

	const corrected = spdxCorrect(expression)
	if (corrected) return corrected

	throw new PyprojectError(`Invalid SPDX license expression: "${expression}"`)
}
