import { z } from 'zod'
import type { NormalizedLicense, NormalizedReadme } from '../normalize'
import type { UnknownKeyPolicy } from '../types'
import { correctSpdx, normalizePep503Name } from '../normalize'

const personSchema = z
	.object({
		email: z.string().optional(),
		name: z.string().optional(),
	})
	.loose()

const readmeRawSchema = z.union([
	z.string(),
	z
		.object({
			'content-type': z.string().optional(),
			file: z.string().optional(),
			text: z.string().optional(),
		})
		.loose(),
])

const licenseRawSchema = z.union([
	z.string(),
	z
		.object({
			file: z.string().optional(),
			text: z.string().optional(),
		})
		.loose(),
])

function inferContentType(file: string): string | undefined {
	const lower = file.toLowerCase()
	if (lower.endsWith('.md')) return 'text/markdown'
	if (lower.endsWith('.rst')) return 'text/x-rst'
	if (lower.endsWith('.txt')) return 'text/plain'
	return undefined
}

function transformReadme(
	raw: undefined | z.output<typeof readmeRawSchema>,
): NormalizedReadme | undefined {
	if (raw === undefined) return undefined

	if (typeof raw === 'string') {
		return { contentType: inferContentType(raw), file: raw }
	}

	const contentType = raw['content-type'] ?? (raw.file ? inferContentType(raw.file) : undefined)

	if (raw.file !== undefined) return { contentType, file: raw.file }
	if (raw.text !== undefined) return { contentType, text: raw.text }

	return undefined
}

function transformLicense(
	raw: undefined | z.output<typeof licenseRawSchema>,
): NormalizedLicense | undefined {
	if (raw === undefined) return undefined

	if (typeof raw === 'string') {
		return { spdx: correctSpdx(raw) }
	}

	if (raw.file !== undefined) return { file: raw.file }
	if (raw.text !== undefined) return { text: raw.text }

	return undefined
}

const projectRawShape = {
	authors: z.array(z.union([personSchema, z.string()])).optional(),
	classifiers: z.array(z.string()).optional(),
	dependencies: z.array(z.string()).optional(),
	description: z.string().optional(),
	dynamic: z.array(z.string()).optional(),
	'entry-points': z.record(z.string(), z.record(z.string(), z.string())).optional(),
	'gui-scripts': z.record(z.string(), z.string()).optional(),
	keywords: z.array(z.string()).optional(),
	license: licenseRawSchema.optional(),
	'license-files': z.array(z.string()).optional(),
	maintainers: z.array(z.union([personSchema, z.string()])).optional(),
	name: z.string().optional(),
	'optional-dependencies': z.record(z.string(), z.array(z.string())).optional(),
	readme: readmeRawSchema.optional(),
	'requires-python': z.string().optional(),
	scripts: z.record(z.string(), z.string()).optional(),
	urls: z.record(z.string(), z.string()).optional(),
	version: z.string().optional(),
}

/**
 * Create a Zod schema for the PEP 621 [project] table.
 */
export function createProjectSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	const base = z.object(projectRawShape)
	const object =
		unknownKeyPolicy === 'error' ? base.strict() : unknownKeyPolicy === 'strip' ? base : base.loose()
	return object.transform(
		({
			'entry-points': entryPoints,
			'gui-scripts': guiScripts,
			license,
			'license-files': licenseFiles,
			name,
			'optional-dependencies': optionalDependencies,
			readme,
			'requires-python': requiresPython,
			...rest
		}) => ({
			...rest,
			entryPoints,
			guiScripts,
			license: transformLicense(license),
			licenseFiles,
			name: name ? normalizePep503Name(name) : undefined,
			optionalDependencies,
			rawName: name,
			readme: transformReadme(readme),
			requiresPython,
		}),
	)
}
