import { createServer } from 'http'
import { createApp } from './app'
import { env } from './config/env'
import { initSocketServer } from './socket'

const app = createApp()
const server = createServer(app)

initSocketServer(server)

server.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`)
})
