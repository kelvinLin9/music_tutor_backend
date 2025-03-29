import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: '音樂家教平台 API',
            version: '1.0.0',
            description: '音樂家教平台的 API 文檔',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: '開發環境',
            },
            {
                url: 'https://your-production-url.com',
                description: '生產環境',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{
            bearerAuth: [],
        }],
    },
    apis: ['./routes/*.js'], // 指定路由檔案的位置
};

export const specs = swaggerJsdoc(options); 