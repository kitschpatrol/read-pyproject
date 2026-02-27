import { z } from 'zod'

/** Diagnostic severity level used by pyright report* options. */
const diagnosticSeverity = z.union([
	z.enum(['none', 'warning', 'error', 'information']),
	z.boolean(),
])

/**
 * Create a Zod schema for the [tool.pyright] table.
 */
export function createPyrightSchema(strict: boolean) {
	const base = z.object({
		// Core configuration
		defineConstant: z.record(z.string(), z.union([z.boolean(), z.string()])).optional(),
		exclude: z.array(z.string()).optional(),
		executionEnvironments: z.array(z.record(z.string(), z.unknown())).optional(),
		extends: z.string().optional(),
		extraPaths: z.array(z.string()).optional(),
		ignore: z.array(z.string()).optional(),
		include: z.array(z.string()).optional(),
		pythonPlatform: z.string().optional(),
		pythonVersion: z.string().optional(),
		// Common diagnostic rules (all accept severity or boolean)
		reportAssertAlwaysTrue: diagnosticSeverity.optional(),
		reportConstantRedefinition: diagnosticSeverity.optional(),
		reportDeprecated: diagnosticSeverity.optional(),
		reportDuplicateImport: diagnosticSeverity.optional(),
		reportFunctionMemberAccess: diagnosticSeverity.optional(),
		reportGeneralTypeIssues: diagnosticSeverity.optional(),
		reportIncompatibleMethodOverride: diagnosticSeverity.optional(),
		reportIncompatibleVariableOverride: diagnosticSeverity.optional(),
		reportIncompleteStub: diagnosticSeverity.optional(),
		reportInconsistentConstructor: diagnosticSeverity.optional(),
		reportInvalidStringEscapeSequence: diagnosticSeverity.optional(),
		reportInvalidStubStatement: diagnosticSeverity.optional(),
		reportInvalidTypeVarUse: diagnosticSeverity.optional(),
		reportMatchNotExhaustive: diagnosticSeverity.optional(),
		reportMissingImports: diagnosticSeverity.optional(),
		reportMissingModuleSource: diagnosticSeverity.optional(),
		reportMissingParameterType: diagnosticSeverity.optional(),
		reportMissingTypeArgument: diagnosticSeverity.optional(),
		reportMissingTypeStubs: diagnosticSeverity.optional(),
		reportOverlappingOverload: diagnosticSeverity.optional(),
		reportPrivateImportUsage: diagnosticSeverity.optional(),
		reportPrivateUsage: diagnosticSeverity.optional(),
		reportSelfClsParameterName: diagnosticSeverity.optional(),
		reportTypeCommentUsage: diagnosticSeverity.optional(),
		reportUnboundVariable: diagnosticSeverity.optional(),
		reportUnknownArgumentType: diagnosticSeverity.optional(),
		reportUnknownLambdaType: diagnosticSeverity.optional(),
		reportUnknownMemberType: diagnosticSeverity.optional(),
		reportUnknownParameterType: diagnosticSeverity.optional(),
		reportUnknownVariableType: diagnosticSeverity.optional(),
		reportUnnecessaryCast: diagnosticSeverity.optional(),
		reportUnnecessaryComparison: diagnosticSeverity.optional(),
		reportUnnecessaryContains: diagnosticSeverity.optional(),
		reportUnnecessaryIsInstance: diagnosticSeverity.optional(),
		reportUnnecessaryTypeIgnoreComment: diagnosticSeverity.optional(),
		reportUnsupportedDunderAll: diagnosticSeverity.optional(),
		reportUntypedBaseClass: diagnosticSeverity.optional(),
		reportUntypedClassDecorator: diagnosticSeverity.optional(),
		reportUntypedFunctionDecorator: diagnosticSeverity.optional(),
		reportUntypedNamedTuple: diagnosticSeverity.optional(),
		reportUnusedClass: diagnosticSeverity.optional(),
		reportUnusedExpression: diagnosticSeverity.optional(),
		reportUnusedFunction: diagnosticSeverity.optional(),
		reportUnusedImport: diagnosticSeverity.optional(),
		reportUnusedVariable: diagnosticSeverity.optional(),
		reportWildcardImportFromLibrary: diagnosticSeverity.optional(),
		strict: z.array(z.string()).optional(),
		// Strict inference flags
		strictDictionaryInference: z.boolean().optional(),
		strictListInference: z.boolean().optional(),
		strictSetInference: z.boolean().optional(),
		stubPath: z.string().optional(),
		typeCheckingMode: z.string().optional(),
		typeshedPath: z.string().optional(),
		useLibraryCodeForTypes: z.boolean().optional(),
		venv: z.string().optional(),
		venvPath: z.string().optional(),
		verboseOutput: z.boolean().optional(),
	})

	// Always loose — pyright adds new diagnostic rules frequently
	return strict ? base.strict() : base.loose()
}
