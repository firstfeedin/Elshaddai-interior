"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['log', 'error', 'warn', 'debug'],
    });
    const config = app.get(config_1.ConfigService);
    const port = config.get('PORT', 3001);
    const clientUrl = config.get('CLIENT_URL', 'http://localhost:5173');
    app.use((0, helmet_1.default)({ crossOriginEmbedderPolicy: false }));
    app.use(compression());
    app.use(cookieParser());
    app.enableCors({
        origin: [clientUrl, 'http://localhost:5173', 'http://localhost:3000'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    if (config.get('NODE_ENV') !== 'production') {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle('El Shaddai API')
            .setDescription('El Shaddai Interior Design Platform — REST API')
            .setVersion('2.0')
            .addBearerAuth()
            .addTag('auth', 'Authentication & authorisation')
            .addTag('users', 'User management')
            .addTag('organisations', 'Organisation management')
            .addTag('projects', 'Project lifecycle')
            .addTag('tasks', 'Task & Kanban board')
            .addTag('time-logs', 'Time tracking')
            .addTag('expenses', 'Expense management')
            .addTag('messages', 'Project messaging')
            .addTag('design-assets', 'Design file uploads')
            .addTag('ai', 'AI design generation')
            .addTag('admin', 'Admin panel')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
    }
    await app.listen(port);
    console.log(`\n🏠  El Shaddai API running on http://localhost:${port}/api`);
    console.log(`📖  Swagger docs  → http://localhost:${port}/api/docs\n`);
}
bootstrap();
//# sourceMappingURL=main.js.map