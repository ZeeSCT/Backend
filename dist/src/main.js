"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
async function bootstrap() { const app = await core_1.NestFactory.create(app_module_1.AppModule); app.use((0, helmet_1.default)()); app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'], credentials: true }); app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true })); const config = new swagger_1.DocumentBuilder().setTitle('Scientechnic Unified Platform API').setDescription('Dashboard backend APIs').setVersion('1.0.0').addBearerAuth().build(); const doc = swagger_1.SwaggerModule.createDocument(app, config); swagger_1.SwaggerModule.setup('api/docs', app, doc); await app.listen(process.env.PORT || 3001); console.log(`API running on http://localhost:${process.env.PORT || 3001}`); }
bootstrap();
//# sourceMappingURL=main.js.map