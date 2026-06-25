import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify'

import { AppModule } from './modules/app.module'

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())
	await app.listen({ port: process.env.PORT || 3000 })
}
bootstrap()
