/**
 * Swagger/OpenAPI Configuration
 * API Documentation for VSP Electronics Backend
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VSP Electronics Backend API',
      description: 'Complete REST API for managing electronic products, orders, and inventory. Supports CRUD operations, filtering, pagination, and bulk imports.',
      version: '1.0.0',
      contact: {
        name: 'VSP Electronics',
        url: 'http://localhost:4200'
      },
      license: {
        name: 'MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server'
      },
      {
        url: 'http://localhost:8080',
        description: 'Production Server'
      }
    ],
    tags: [
      {
        name: 'Products',
        description: 'Product management endpoints'
      },
      {
        name: 'Featured Categories',
        description: 'Featured categories management'
      },
      {
        name: 'Featured Brands',
        description: 'Featured brands management'
      },
      {
        name: 'Cart',
        description: 'Shopping cart management endpoints'
      },
      {
        name: 'Orders',
        description: 'Order management endpoints'
      },
      {
        name: 'Statistics',
        description: 'Analytics and statistics endpoints'
      },
      {
        name: 'Admin',
        description: 'Administrative operations'
      }
    ],
    components: {
      schemas: {
        Product: {
          type: 'object',
          required: ['name', 'price', 'category'],
          properties: {
            id: {
              type: 'integer',
              description: 'Unique product identifier',
              example: 1
            },
            name: {
              type: 'string',
              description: 'Product name',
              example: '4WD Mecannum Wheel Robot Kit'
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Product price in rupees',
              example: 3499.99
            },
            description: {
              type: 'string',
              description: 'Detailed product description',
              example: 'High-quality robot kit with Mecannum wheels for omnidirectional movement'
            },
            category: {
              type: 'string',
              description: 'Product category',
              example: 'Robotic DIY Kits'
            },
            brand: {
              type: 'string',
              description: 'Product brand name',
              example: 'Agarwal Electronics'
            },
            image: {
              type: 'string',
              description: 'Product image URL or path',
              example: '/assets/images/products/robotic-diy-kits/4wd-mecannum.jpg'
            },
            inStock: {
              type: 'boolean',
              description: 'Availability status',
              example: true
            },
            isHot: {
              type: 'boolean',
              description: 'Hot/trending product flag',
              example: false
            },
            isNew: {
              type: 'boolean',
              description: 'New product flag',
              example: true
            },
            rating: {
              type: 'number',
              format: 'float',
              description: 'Product rating (0-5)',
              example: 4.5
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Product creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last product update timestamp'
            }
          }
        },
        ProductList: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Product'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                total: {
                  type: 'integer',
                  example: 50
                },
                limit: {
                  type: 'integer',
                  example: 12
                },
                offset: {
                  type: 'integer',
                  example: 0
                },
                hasMore: {
                  type: 'boolean',
                  example: true
                }
              }
            }
          }
        },
        ProductResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              $ref: '#/components/schemas/Product'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Product not found'
            }
          }
        },
        BulkImportRequest: {
          type: 'object',
          properties: {
            productsData: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  price: { type: 'number' },
                  description: { type: 'string' },
                  category: { type: 'string' },
                  brand: { type: 'string' },
                  image: { type: 'string' },
                  inStock: { type: 'boolean' },
                  isHot: { type: 'boolean' },
                  isNew: { type: 'boolean' },
                  rating: { type: 'number' }
                }
              }
            }
          }
        },
        Statistics: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              properties: {
                totalProducts: {
                  type: 'integer',
                  example: 150
                },
                totalCategories: {
                  type: 'integer',
                  example: 12
                },
                totalBrands: {
                  type: 'integer',
                  example: 8
                },
                hotProducts: {
                  type: 'integer',
                  example: 25
                },
                newProducts: {
                  type: 'integer',
                  example: 30
                },
                inStock: {
                  type: 'integer',
                  example: 140
                },
                outOfStock: {
                  type: 'integer',
                  example: 10
                },
                averageRating: {
                  type: 'number',
                  format: 'float',
                  example: 4.2
                },
                priceRange: {
                  type: 'object',
                  properties: {
                    min: { type: 'number', example: 99.99 },
                    max: { type: 'number', example: 5999.99 }
                  }
                },
                categories: {
                  type: 'array',
                  items: { type: 'string' }
                },
                brands: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Unauthorized access',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        BadRequestError: {
          description: 'Bad request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token for authentication. Use the token returned from /api/auth/login'
        }
      }
    }
  },
  apis: ['./server/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
