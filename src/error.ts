export class PyprojectError extends Error {
	filePath?: string
	override name = 'PyprojectError'

	constructor(message: string, options?: { cause?: Error; filePath?: string }) {
		super(message, options?.cause ? { cause: options.cause } : undefined)
		this.filePath = options?.filePath
	}
}
