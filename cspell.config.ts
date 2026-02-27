import { cspellConfig } from '@kitschpatrol/cspell-config'

export default cspellConfig({
	ignorePaths: ['test/fixtures/**/*'],
	words: ['addopts', 'filterwarnings', 'isort', 'mypy', 'setuptools', 'smol', 'testpaths'],
})
