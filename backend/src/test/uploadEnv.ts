import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const uploadDir = path.join(os.tmpdir(), `events-room-uploads-${process.pid}`)
fs.mkdirSync(uploadDir, { recursive: true })
process.env.UPLOAD_DIR = uploadDir
process.env.PUBLIC_UPLOAD_BASE_URL = '/uploads'
process.env.MAX_UPLOAD_SIZE_MB = '1.5'
