import { fileTests } from '@lezer/generator/dist/test'
import { parser } from './slidesParser'
import { readFileSync } from 'node:fs'

const testFileName = 'tests.txt'
const testFilePath = 'src/parser/tests.txt'
const testFile = readFileSync(testFilePath)
const tests = fileTests(testFile.toString(), testFileName)
tests.forEach(test => test.run(parser))
