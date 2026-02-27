import { z } from 'zod'

/** String or array of strings. */
const multiString = z.union([z.string(), z.array(z.string())])

/**
 * Create a Zod schema for the [tool.codespell] table.
 * @see [Codespell README (configuration)](https://github.com/codespell-project/codespell#readme)
 */
export function createCodespellSchema(strict: boolean) {
	const base = z.object({
		'after-context': z.number().optional(),
		'before-context': z.number().optional(),
		builtin: z.string().optional(),
		'check-filenames': z.boolean().optional(),
		'check-hidden': z.boolean().optional(),
		context: z.number().optional(),
		count: z.boolean().optional(),
		dictionary: multiString.optional(),
		'exclude-file': multiString.optional(),
		'ignore-multiline-regex': z.string().optional(),
		'ignore-regex': z.string().optional(),
		'ignore-words': multiString.optional(),
		'ignore-words-list': multiString.optional(),
		interactive: z.number().optional(),
		'quiet-level': z.number().optional(),
		regex: z.string().optional(),
		skip: multiString.optional(),
		'uri-ignore-words-list': multiString.optional(),
		'uri-regex': z.string().optional(),
		'write-changes': z.boolean().optional(),
	})

	const object = strict ? base.strict() : base.loose()
	return object.transform(
		({
			'after-context': afterContext,
			'before-context': beforeContext,
			'check-filenames': checkFilenames,
			'check-hidden': checkHidden,
			'exclude-file': excludeFile,
			'ignore-multiline-regex': ignoreMultilineRegex,
			'ignore-regex': ignoreRegex,
			'ignore-words': ignoreWords,
			'ignore-words-list': ignoreWordsList,
			'quiet-level': quietLevel,
			'uri-ignore-words-list': uriIgnoreWordsList,
			'uri-regex': uriRegex,
			'write-changes': writeChanges,
			...rest
		}) => ({
			...rest,
			afterContext,
			beforeContext,
			checkFilenames,
			checkHidden,
			excludeFile,
			ignoreMultilineRegex,
			ignoreRegex,
			ignoreWords,
			ignoreWordsList,
			quietLevel,
			uriIgnoreWordsList,
			uriRegex,
			writeChanges,
		}),
	)
}
