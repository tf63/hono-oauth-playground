import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.text('Resource Server!!'))

export default app
