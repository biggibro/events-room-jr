import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'

const specPath = path.resolve(process.cwd(), 'openapi.yaml')

export const swaggerSpec = parse(fs.readFileSync(specPath, 'utf8'))
