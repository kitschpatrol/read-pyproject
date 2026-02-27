import fs from 'node:fs'
import path from 'node:path'

const dir = 'test/fixtures'
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.toml'))
const results: Array<{ file: string; sections: string[] }> = []

for (const f of files) {
	const content = fs.readFileSync(path.join(dir, f), 'utf8')
	if (content.includes('[tool.coverage')) {
		const sections = [...content.matchAll(/\[tool\.coverage\.(\w+)\]/g)].map((m) => m[1])
		results.push({ file: f, sections })
	}
}

console.log('Total fixtures with [tool.coverage]:', results.length)
const sectionCounts: Record<string, number> = {}
for (const r of results) {
	for (const s of r.sections) {
		sectionCounts[s] = (sectionCounts[s] || 0) + 1
	}
}
console.log('Section frequency:', JSON.stringify(sectionCounts, null, 2))

// Show examples
for (const r of results.slice(0, 10)) {
	console.log('\n=== ' + r.file + ' ===')
	const content = fs.readFileSync(path.join(dir, r.file), 'utf8')
	const lines = content.split('\n')
	let inCoverage = false
	for (const line of lines) {
		if (/\[tool\.coverage/.test(line)) inCoverage = true
		else if (/^\[/.test(line) && !/\[tool\.coverage/.test(line)) inCoverage = false
		if (inCoverage) console.log(line)
	}
}
