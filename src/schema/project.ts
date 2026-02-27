import { z } from 'zod'
import type { NormalizedLicense, NormalizedReadme } from '../normalize'
import type { UnknownKeyPolicy } from '../types'
import { correctSpdx, normalizePep503Name } from '../normalize'

function transformReadme(
	raw: string | undefined | { 'content-type'?: string; file?: string; text?: string },
): NormalizedReadme | undefined {
	if (raw === undefined) return undefined

	if (typeof raw === 'string') return raw

	if (raw.file !== undefined) return raw.file

	if (raw.text !== undefined) {
		const contentType = raw['content-type']
		return contentType ? { contentType, text: raw.text } : { text: raw.text }
	}

	return undefined
}

function transformLicense(
	raw: string | undefined | { file?: string; text?: string },
): NormalizedLicense | undefined {
	if (raw === undefined) return undefined

	if (typeof raw === 'string') {
		return { spdx: correctSpdx(raw) }
	}

	if (raw.file !== undefined) return { file: raw.file }
	if (raw.text !== undefined) return { text: raw.text }

	return undefined
}

/**
 * Create a Zod schema for the PEP 621 [project] table.
 */
export function createProjectSchema(unknownKeyPolicy: UnknownKeyPolicy) {
	const personBase = z.object({
		email: z.string().optional(),
		name: z.string().optional(),
	})
	const personSchema =
		unknownKeyPolicy === 'error'
			? personBase.strict()
			: unknownKeyPolicy === 'strip'
				? personBase
				: personBase.loose()

	const readmeObjectBase = z.object({
		'content-type': z.string().optional(),
		file: z.string().optional(),
		text: z.string().optional(),
	})
	const readmeObject =
		unknownKeyPolicy === 'error'
			? readmeObjectBase.strict()
			: unknownKeyPolicy === 'strip'
				? readmeObjectBase
				: readmeObjectBase.loose()
	const readmeRawSchema = z.union([z.string(), readmeObject])

	const licenseObjectBase = z.object({
		file: z.string().optional(),
		text: z.string().optional(),
	})
	const licenseObject =
		unknownKeyPolicy === 'error'
			? licenseObjectBase.strict()
			: unknownKeyPolicy === 'strip'
				? licenseObjectBase
				: licenseObjectBase.loose()
	const licenseRawSchema = z.union([z.string(), licenseObject])

	const base = z.object({
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
	})
	const object =
		unknownKeyPolicy === 'error'
			? base.strict()
			: unknownKeyPolicy === 'strip'
				? base
				: base.loose()
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
