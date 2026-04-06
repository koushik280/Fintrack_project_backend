// server/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FinTrack API',
      version: '1.0.0',
      description: 'Complete API documentation for FinTrack – Personal Finance Management Application',
      contact: {
        name: 'Your Name',
        email: 'support@fintrack.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
      {
        url: 'https://your-backend.onrender.com/api',
        description: 'Production server',
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
      schemas: {
        // ----- Auth & User -----
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
            plan: { type: 'string', enum: ['free', 'pro'] },
            isBlocked: { type: 'boolean' },
            subscription: {
              type: 'object',
              properties: {
                plan: { type: 'string', enum: ['free', 'pro'] },
                status: { type: 'string', enum: ['active', 'expired', 'canceled'] },
                startDate: { type: 'string', format: 'date-time' },
                endDate: { type: 'string', format: 'date-time' },
              },
            },
            bio: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        },
        UpdateProfileRequest: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            bio: { type: 'string' },
          },
        },
        ForgotPasswordRequest: {
          type: 'object',
          required: ['email'],
          properties: { email: { type: 'string', format: 'email' } },
        },
        ResetPasswordRequest: {
          type: 'object',
          required: ['token', 'newPassword'],
          properties: {
            token: { type: 'string' },
            newPassword: { type: 'string', minLength: 6 },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            plan: { type: 'string' },
            subscription: { $ref: '#/components/schemas/User/properties/subscription' },
            bio: { type: 'string' },
            accessToken: { type: 'string' },
          },
        },
        MessageResponse: {
          type: 'object',
          properties: { message: { type: 'string' } },
        },
        // ----- Card -----
        Card: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            nickname: { type: 'string' },
            lastFour: { type: 'string' },
            bank: { type: 'string' },
            type: { type: 'string', enum: ['Visa', 'Mastercard', 'Amex', 'Discover'] },
            balance: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateCardRequest: {
          type: 'object',
          required: ['nickname', 'lastFour', 'bank', 'type', 'balance'],
          properties: {
            nickname: { type: 'string' },
            lastFour: { type: 'string', minLength: 4, maxLength: 4 },
            bank: { type: 'string' },
            type: { type: 'string', enum: ['Visa', 'Mastercard', 'Amex', 'Discover'] },
            balance: { type: 'number' },
          },
        },
        UpdateCardRequest: {
          type: 'object',
          properties: {
            nickname: { type: 'string' },
            lastFour: { type: 'string' },
            bank: { type: 'string' },
            type: { type: 'string' },
            balance: { type: 'number' },
          },
        },
        // ----- Transaction -----
        Transaction: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            amount: { type: 'number' },
            date: { type: 'string', format: 'date' },
            description: { type: 'string' },
            category: { type: 'string' },
            type: { type: 'string', enum: ['income', 'expense'] },
            cardId: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateTransactionRequest: {
          type: 'object',
          required: ['amount', 'description', 'category', 'type'],
          properties: {
            amount: { type: 'number' },
            date: { type: 'string', format: 'date' },
            description: { type: 'string' },
            category: { type: 'string' },
            type: { type: 'string', enum: ['income', 'expense'] },
            cardId: { type: 'string', nullable: true },
          },
        },
        UpdateTransactionRequest: {
          type: 'object',
          properties: {
            amount: { type: 'number' },
            date: { type: 'string', format: 'date' },
            description: { type: 'string' },
            category: { type: 'string' },
            type: { type: 'string' },
            cardId: { type: 'string', nullable: true },
          },
        },
        TransactionListResponse: {
          type: 'object',
          properties: {
            transactions: { type: 'array', items: { $ref: '#/components/schemas/Transaction' } },
            total: { type: 'number' },
            page: { type: 'number' },
            pages: { type: 'number' },
          },
        },
        // ----- Budget -----
        Budget: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            category: { type: 'string' },
            month: { type: 'string', pattern: '^\\d{4}-\\d{2}$' },
            amount: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateBudgetRequest: {
          type: 'object',
          required: ['category', 'month', 'amount'],
          properties: {
            category: { type: 'string' },
            month: { type: 'string', pattern: '^\\d{4}-\\d{2}$' },
            amount: { type: 'number', minimum: 0 },
          },
        },
        UpdateBudgetRequest: {
          type: 'object',
          properties: {
            category: { type: 'string' },
            month: { type: 'string' },
            amount: { type: 'number' },
          },
        },
        // ----- Analytics -----
        SummaryResponse: {
          type: 'object',
          properties: {
            income: { type: 'number' },
            expenses: { type: 'number' },
            balance: { type: 'number' },
          },
        },
        MonthlyAnalytics: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              month: { type: 'string' },
              income: { type: 'number' },
              expenses: { type: 'number' },
            },
          },
        },
        CategorySpending: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              value: { type: 'number' },
            },
          },
        },
        NetWorthResponse: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              month: { type: 'string' },
              netWorth: { type: 'number' },
            },
          },
        },
        // ----- Admin -----
        AdminDashboardStats: {
          type: 'object',
          properties: {
            totalUsers: { type: 'number' },
            totalTransactions: { type: 'number' },
            totalIncome: { type: 'number' },
            totalExpense: { type: 'number' },
            cashCount: { type: 'number' },
            cardCount: { type: 'number' },
            recentTransactions: { type: 'array', items: { $ref: '#/components/schemas/AdminTransaction' } },
          },
        },
        AdminUserListResponse: {
          type: 'object',
          properties: {
            users: { type: 'array', items: { $ref: '#/components/schemas/AdminUser' } },
            total: { type: 'number' },
            page: { type: 'number' },
            pages: { type: 'number' },
          },
        },
        AdminUserDetails: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/AdminUser' },
            totalIncome: { type: 'number' },
            totalExpense: { type: 'number' },
            recentTransactions: { type: 'array', items: { $ref: '#/components/schemas/Transaction' } },
          },
        },
        AdminUser: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            plan: { type: 'string' },
            isBlocked: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AdminTransaction: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            amount: { type: 'number' },
            date: { type: 'string', format: 'date' },
            description: { type: 'string' },
            category: { type: 'string' },
            type: { type: 'string', enum: ['income', 'expense'] },
            user: { type: 'object', properties: { _id: { type: 'string' }, name: { type: 'string' }, email: { type: 'string' } } },
            card: { type: 'object', properties: { nickname: { type: 'string' }, lastFour: { type: 'string' } }, nullable: true },
          },
        },
        AdminTransactionListResponse: {
          type: 'object',
          properties: {
            transactions: { type: 'array', items: { $ref: '#/components/schemas/AdminTransaction' } },
            total: { type: 'number' },
            page: { type: 'number' },
            pages: { type: 'number' },
          },
        },
        FlagTransactionRequest: {
          type: 'object',
          properties: { reason: { type: 'string' } },
        },
        AuditLog: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            adminId: { type: 'object', properties: { _id: { type: 'string' }, name: { type: 'string' }, email: { type: 'string' } } },
            action: { type: 'string' },
            targetId: { type: 'string' },
            targetModel: { type: 'string' },
            details: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AuditLogListResponse: {
          type: 'object',
          properties: {
            logs: { type: 'array', items: { $ref: '#/components/schemas/AuditLog' } },
            total: { type: 'number' },
            page: { type: 'number' },
            pages: { type: 'number' },
          },
        },
        SystemCategory: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateSystemCategoryRequest: {
          type: 'object',
          required: ['name'],
          properties: { name: { type: 'string' } },
        },
        UserCategory: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            user: { type: 'object', properties: { _id: { type: 'string' }, name: { type: 'string' }, email: { type: 'string' } } },
            isActive: { type: 'boolean' },
            isFlagged: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CategoryAnalytics: {
          type: 'object',
          properties: {
            mostUsed: { type: 'array', items: { type: 'object', properties: { _id: { type: 'string' }, count: { type: 'number' } } } },
            spending: { type: 'array', items: { type: 'object', properties: { _id: { type: 'string' }, total: { type: 'number' } } } },
          },
        },
        ContentItem: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            type: { type: 'string', enum: ['feature', 'testimonial', 'faq'] },
            data: { type: 'object' },
            order: { type: 'number' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateContentRequest: {
          type: 'object',
          required: ['type', 'data'],
          properties: {
            type: { type: 'string', enum: ['feature', 'testimonial', 'faq'] },
            data: { type: 'object' },
            order: { type: 'number' },
          },
        },
        // ----- Payment -----
        PaymentSessionResponse: {
          type: 'object',
          properties: {
            sessionId: { type: 'string' },
            mockPaymentUrl: { type: 'string' },
          },
        },
        VerifyPaymentRequest: {
          type: 'object',
          required: ['sessionId', 'success'],
          properties: {
            sessionId: { type: 'string' },
            success: { type: 'boolean' },
          },
        },
        // ----- Category (user) -----
        UserCategory: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string', enum: ['system', 'user'] },
            isActive: { type: 'boolean' },
          },
        },
        CreateUserCategoryRequest: {
          type: 'object',
          required: ['name'],
          properties: { name: { type: 'string' } },
        },
        // ----- Notification -----
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            type: { type: 'string', enum: ['transaction', 'budget'] },
            title: { type: 'string' },
            message: { type: 'string' },
            data: { type: 'object' },
            read: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [], // We'll define paths manually to keep everything in one file
};

// Build paths manually
const paths = {
  // ---------------------- AUTH ----------------------
  '/auth/register': {
    post: {
      summary: 'Register a new user',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
      },
      responses: {
        201: { description: 'User created', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
        400: { description: 'User already exists' },
        500: { description: 'Server error' },
      },
    },
  },
  '/auth/login': {
    post: {
      summary: 'Login user',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
      },
      responses: {
        200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
        401: { description: 'Invalid credentials' },
        500: { description: 'Server error' },
      },
    },
  },
  '/auth/admin/login': {
    post: {
      summary: 'Admin login',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
      },
      responses: {
        200: { description: 'Admin login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
        401: { description: 'Invalid credentials' },
        403: { description: 'Not an admin' },
        500: { description: 'Server error' },
      },
    },
  },
  '/auth/logout': {
    post: {
      summary: 'Logout user',
      tags: ['Auth'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Logged out', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
        500: { description: 'Server error' },
      },
    },
  },
  '/auth/me': {
    get: {
      summary: 'Get current user',
      tags: ['Auth'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'User data', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
        401: { description: 'Unauthorized' },
        500: { description: 'Server error' },
      },
    },
    put: {
      summary: 'Update current user profile',
      tags: ['Auth'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProfileRequest' } } },
      },
      responses: {
        200: { description: 'Profile updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
        400: { description: 'Validation error' },
        401: { description: 'Unauthorized' },
        500: { description: 'Server error' },
      },
    },
  },
  '/auth/refresh': {
    post: {
      summary: 'Refresh access token',
      tags: ['Auth'],
      responses: {
        200: { description: 'New access token', content: { 'application/json': { schema: { type: 'object', properties: { accessToken: { type: 'string' } } } } } },
        401: { description: 'No refresh token' },
        403: { description: 'Invalid refresh token' },
      },
    },
  },
  '/auth/forgot-password': {
    post: {
      summary: 'Request password reset',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ForgotPasswordRequest' } } },
      },
      responses: {
        200: { description: 'Reset email sent', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
        404: { description: 'Email not found' },
        500: { description: 'Server error' },
      },
    },
  },
  '/auth/reset-password': {
    post: {
      summary: 'Reset password',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ResetPasswordRequest' } } },
      },
      responses: {
        200: { description: 'Password reset successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
        400: { description: 'Invalid or expired token' },
        500: { description: 'Server error' },
      },
    },
  },
  // ---------------------- CARDS ----------------------
  '/cards': {
    get: {
      summary: 'Get all cards for logged‑in user',
      tags: ['Cards'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'List of cards', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Card' } } } } },
        401: { description: 'Unauthorized' },
        500: { description: 'Server error' },
      },
    },
    post: {
      summary: 'Create a new card',
      tags: ['Cards'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateCardRequest' } } },
      },
      responses: {
        201: { description: 'Card created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Card' } } } },
        400: { description: 'Validation error' },
        401: { description: 'Unauthorized' },
        500: { description: 'Server error' },
      },
    },
  },
  '/cards/{id}': {
    put: {
      summary: 'Update a card',
      tags: ['Cards'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateCardRequest' } } },
      },
      responses: {
        200: { description: 'Card updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Card' } } } },
        401: { description: 'Unauthorized' },
        404: { description: 'Card not found' },
        500: { description: 'Server error' },
      },
    },
    delete: {
      summary: 'Delete a card',
      tags: ['Cards'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Card deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
        401: { description: 'Unauthorized' },
        404: { description: 'Card not found' },
        500: { description: 'Server error' },
      },
    },
  },
  // ---------------------- TRANSACTIONS ----------------------
  '/transactions': {
    get: {
      summary: 'Get user transactions with pagination, search, filters',
      tags: ['Transactions'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['date', 'amount'], default: 'date' } },
        { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
        { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
        { name: 'category', in: 'query', schema: { type: 'string' } },
        { name: 'type', in: 'query', schema: { type: 'string', enum: ['income', 'expense'] } },
        { name: 'cardId', in: 'query', schema: { type: 'string' } },
      ],
      responses: {
        200: { description: 'Paginated transactions', content: { 'application/json': { schema: { $ref: '#/components/schemas/TransactionListResponse' } } } },
        401: { description: 'Unauthorized' },
        500: { description: 'Server error' },
      },
    },
    post: {
      summary: 'Create a new transaction',
      tags: ['Transactions'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateTransactionRequest' } } },
      },
      responses: {
        201: { description: 'Transaction created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Transaction' } } } },
        400: { description: 'Validation error' },
        401: { description: 'Unauthorized' },
        500: { description: 'Server error' },
      },
    },
  },
  '/transactions/{id}': {
    put: {
      summary: 'Update a transaction',
      tags: ['Transactions'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateTransactionRequest' } } },
      },
      responses: {
        200: { description: 'Transaction updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Transaction' } } } },
        401: { description: 'Unauthorized' },
        404: { description: 'Transaction not found' },
        500: { description: 'Server error' },
      },
    },
    delete: {
      summary: 'Delete a transaction',
      tags: ['Transactions'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Transaction deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
        401: { description: 'Unauthorized' },
        404: { description: 'Transaction not found' },
        500: { description: 'Server error' },
      },
    },
  },
  '/transactions/import': {
    post: {
      summary: 'Import transactions from CSV (Cloudinary upload)',
      tags: ['Transactions'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: { file: { type: 'string', format: 'binary' } },
            },
          },
        },
      },
      responses: {
        200: { description: 'Import successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
        400: { description: 'No file or invalid CSV' },
        401: { description: 'Unauthorized' },
        500: { description: 'Server error' },
      },
    },
  },
  // ---------------------- BUDGETS ----------------------
  '/budgets': {
    get: {
      summary: 'Get all budgets for logged‑in user',
      tags: ['Budgets'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'List of budgets', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Budget' } } } } },
        401: { description: 'Unauthorized' },
        500: { description: 'Server error' },
      },
    },
    post: {
      summary: 'Create a new budget',
      tags: ['Budgets'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateBudgetRequest' } } },
      },
      responses: {
        201: { description: 'Budget created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Budget' } } } },
        400: { description: 'Budget already exists' },
        401: { description: 'Unauthorized' },
        500: { description: 'Server error' },
      },
    },
  },
  '/budgets/{id}': {
    put: {
      summary: 'Update a budget',
      tags: ['Budgets'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateBudgetRequest' } } },
      },
      responses: {
        200: { description: 'Budget updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Budget' } } } },
        401: { description: 'Unauthorized' },
        404: { description: 'Budget not found' },
        500: { description: 'Server error' },
      },
    },
    delete: {
      summary: 'Delete a budget',
      tags: ['Budgets'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Budget deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
        401: { description: 'Unauthorized' },
        404: { description: 'Budget not found' },
        500: { description: 'Server error' },
      },
    },
  },
  // ---------------------- ANALYTICS (USER) ----------------------
  '/analytics/summary': {
    get: {
      summary: 'Get current month summary (income, expenses, balance)',
      tags: ['Analytics'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Summary data', content: { 'application/json': { schema: { $ref: '#/components/schemas/SummaryResponse' } } } },
        401: { description: 'Unauthorized' },
        500: { description: 'Server error' },
      },
    },
  },
  '/analytics/monthly': {
    get: {
      summary: 'Get monthly income/expenses for last 6 months',
      tags: ['Analytics'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
        { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
      ],
      responses: {
        200: { description: 'Monthly data', content: { 'application/json': { schema: { $ref: '#/components/schemas/MonthlyAnalytics' } } } },
        401: { description: 'Unauthorized' },
        500: { description: 'Server error' },
      },
    },
  },
  '/analytics/categories': {
    get: {
      summary: 'Get spending by category (expenses only)',
      tags: ['Analytics'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
        { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
      ],
      responses: {
        200: { description: 'Category spending', content: { 'application/json': { schema: { $ref: '#/components/schemas/CategorySpending' } } } },
        401: { description: 'Unauthorized' },
        500: { description: 'Server error' },
      },
    },
  },
  '/analytics/net-worth': {
    get: {
      summary: 'Get cumulative net worth over time',
      tags: ['Analytics'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Net worth timeline', content: { 'application/json': { schema: { $ref: '#/components/schemas/NetWorthResponse' } } } },
        401: { description: 'Unauthorized' },
        500: { description: 'Server error' },
      },
    },
  },
  // ---------------------- ADMIN ----------------------
  '/admin/dashboard': {
    get: {
      summary: 'Get admin dashboard statistics',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Dashboard stats', content: { 'application/json': { schema: { $ref: '#/components/schemas/AdminDashboardStats' } } } },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden – admin only' },
        500: { description: 'Server error' },
      },
    },
  },
  '/admin/users': {
    get: {
      summary: 'Get users with pagination and search',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
      ],
      responses: {
        200: { description: 'Paginated users', content: { 'application/json': { schema: { $ref: '#/components/schemas/AdminUserListResponse' } } } },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Server error' },
      },
    },
  },
  '/admin/users/{id}': {
    get: {
      summary: 'Get user details (income, expenses, recent transactions)',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'User details', content: { 'application/json': { schema: { $ref: '#/components/schemas/AdminUserDetails' } } } },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'User not found' },
        500: { description: 'Server error' },
      },
    },
  },
  '/admin/users/{id}/block': {
    patch: {
      summary: 'Block or unblock a user',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { block: { type: 'boolean' }, reason: { type: 'string' } } } } },
      },
      responses: {
        200: { description: 'User blocked/unblocked', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
        400: { description: 'Cannot block yourself' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'User not found' },
        500: { description: 'Server error' },
      },
    },
  },
  '/admin/transactions': {
    get: {
      summary: 'Get all transactions with filters (admin)',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        { name: 'type', in: 'query', schema: { type: 'string', enum: ['income', 'expense'] } },
        { name: 'mode', in: 'query', schema: { type: 'string', enum: ['cash', 'card'] } },
        { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
        { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
      ],
      responses: {
        200: { description: 'Paginated transactions', content: { 'application/json': { schema: { $ref: '#/components/schemas/AdminTransactionListResponse' } } } },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Server error' },
      },
    },
  },
  '/admin/transactions/{id}/flag': {
    patch: {
      summary: 'Flag a transaction as suspicious',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: false,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/FlagTransactionRequest' } } },
      },
      responses: {
        200: { description: 'Transaction flagged', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
        400: { description: 'Already flagged' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Transaction not found' },
        500: { description: 'Server error' },
      },
    },
  },
  '/admin/analytics/monthly': {
    get: {
      summary: 'Get monthly income/expense trends (all users)',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Monthly trend', content: { 'application/json': { schema: { $ref: '#/components/schemas/MonthlyAnalytics' } } } },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Server error' },
      },
    },
  },
  '/admin/analytics/categories': {
    get: {
      summary: 'Get total spending by category (all users)',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Category spending', content: { 'application/json': { schema: { $ref: '#/components/schemas/CategorySpending' } } } },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Server error' },
      },
    },
  },
  '/admin/audit-logs': {
    get: {
      summary: 'Get audit logs with pagination',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
      ],
      responses: {
        200: { description: 'Audit logs', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuditLogListResponse' } } } },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Server error' },
      },
    },
  },
  // ---------------------- ADMIN CATEGORIES ----------------------
  '/admin/categories': {
    get: {
      summary: 'Get system categories (paginated, search, sort)',
      tags: ['Admin Categories'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['name', 'createdAt'], default: 'name' } },
        { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } },
        { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
      ],
      responses: {
        200: { description: 'Paginated system categories', content: { 'application/json': { schema: { type: 'object', properties: { categories: { type: 'array', items: { $ref: '#/components/schemas/SystemCategory' } }, total: { type: 'number' }, page: { type: 'number' }, pages: { type: 'number' } } } } } },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Server error' },
      },
    },
    post: {
      summary: 'Create a system category',
      tags: ['Admin Categories'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateSystemCategoryRequest' } } },
      },
      responses: {
        201: { description: 'Category created', content: { 'application/json': { schema: { $ref: '#/components/schemas/SystemCategory' } } } },
        400: { description: 'Category already exists' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Server error' },
      },
    },
  },
  '/admin/categories/{id}': {
    patch: {
      summary: 'Update system category (name or active status)',
      tags: ['Admin Categories'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, isActive: { type: 'boolean' } } } } },
      },
      responses: {
        200: { description: 'Category updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SystemCategory' } } } },
        400: { description: 'Invalid data' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Category not found' },
        500: { description: 'Server error' },
      },
    },
    delete: {
      summary: 'Soft‑delete a system category (set isActive = false)',
      tags: ['Admin Categories'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Category deactivated', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Category not found' },
        500: { description: 'Server error' },
      },
    },
  },
  '/admin/categories/user': {
    get: {
      summary: 'Get all user‑created categories (for moderation)',
      tags: ['Admin Categories'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'List of user categories', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/UserCategory' } } } } },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Server error' },
      },
    },
  },
  '/admin/categories/{id}/flag': {
    patch: {
      summary: 'Flag/unflag a user‑created category',
      tags: ['Admin Categories'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Category flagged/unflagged', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Category not found' },
        500: { description: 'Server error' },
      },
    },
  },
  '/admin/categories/analytics': {
    get: {
      summary: 'Get category analytics (most used, spending)',
      tags: ['Admin Categories'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Analytics data', content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryAnalytics' } } } },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Server error' },
      },
    },
  },
  // ---------------------- ADMIN CONTENT ----------------------
  '/admin/content': {
    get: {
      summary: 'Get all landing page content',
      tags: ['Admin Content'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'List of content items', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/ContentItem' } } } } },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Server error' },
      },
    },
    post: {
      summary: 'Create a new content item',
      tags: ['Admin Content'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateContentRequest' } } },
      },
      responses: {
        201: { description: 'Content created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ContentItem' } } } },
        400: { description: 'Invalid data' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        500: { description: 'Server error' },
      },
    },
  },
  '/admin/content/{id}': {
    patch: {
      summary: 'Update a content item',
      tags: ['Admin Content'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'object' }, order: { type: 'number' }, isActive: { type: 'boolean' } } } } },
      },
      responses: {
        200: { description: 'Content updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ContentItem' } } } },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Content not found' },
        500: { description: 'Server error' },
      },
    },
    delete: {
      summary: 'Delete a content item',
      tags: ['Admin Content'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Content deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Content not found' },
        500: { description: 'Server error' },
      },
    },
  },
  // ---------------------- PAYMENTS ----------------------
  '/payments/create-session': {
    post: {
      summary: 'Create a mock checkout session',
      tags: ['Payments'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { plan: { type: 'string', enum: ['pro'], default: 'pro' } } } } },
      },
      responses: {
        200: { description: 'Session created', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaymentSessionResponse' } } } },
        401: { description: 'Unauthorized' },
        500: { description: 'Server error' },
      },
    },
  },
  '/payments/verify': {
    post: {
      summary: 'Verify payment after mock page',
      tags: ['Payments'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyPaymentRequest' } } },
      },
      responses: {
        200: { description: 'Payment verified and subscription updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
        400: { description: 'Payment failed' },
        401: { description: 'Unauthorized' },
        404: { description: 'Session not found' },
        500: { description: 'Server error' },
      },
    },
  },
  '/payments/webhook': {
    post: {
      summary: 'Simulate webhook for payment confirmation',
      tags: ['Payments'],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { sessionId: { type: 'string' }, status: { type: 'string', enum: ['success', 'failed'] } } } } },
      },
      responses: {
        200: { description: 'Webhook received' },
        500: { description: 'Server error' },
      },
    },
  },
  // ---------------------- CATEGORIES (USER) ----------------------
  '/categories': {
    get: {
      summary: 'Get user categories (both system and user’s own)',
      tags: ['Categories'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'List of categories', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/UserCategory' } } } } },
        401: { description: 'Unauthorized' },
        500: { description: 'Server error' },
      },
    },
    post: {
      summary: 'Create a custom user category',
      tags: ['Categories'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateUserCategoryRequest' } } },
      },
      responses: {
        201: { description: 'Category created', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserCategory' } } } },
        400: { description: 'Category already exists' },
        401: { description: 'Unauthorized' },
        500: { description: 'Server error' },
      },
    },
  },
  '/categories/{id}': {
    patch: {
      summary: 'Update a user category (name only)',
      tags: ['Categories'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' } } } } },
      },
      responses: {
        200: { description: 'Category updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserCategory' } } } },
        401: { description: 'Unauthorized' },
        403: { description: 'Not owner' },
        404: { description: 'Category not found' },
        500: { description: 'Server error' },
      },
    },
    delete: {
      summary: 'Delete a user category (soft delete)',
      tags: ['Categories'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Category deactivated', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
        401: { description: 'Unauthorized' },
        403: { description: 'Not owner' },
        404: { description: 'Category not found' },
        500: { description: 'Server error' },
      },
    },
  },
  // ---------------------- CONTENT (PUBLIC) ----------------------
  '/content/{type}': {
    get: {
      summary: 'Get active content by type (feature, testimonial, faq)',
      tags: ['Content'],
      parameters: [{ name: 'type', in: 'path', required: true, schema: { type: 'string', enum: ['feature', 'testimonial', 'faq'] } }],
      responses: {
        200: { description: 'List of content items', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/ContentItem' } } } } },
        400: { description: 'Invalid type' },
        500: { description: 'Server error' },
      },
    },
  },
  // ---------------------- NOTIFICATIONS ----------------------
  '/notifications/unread': {
    get: {
      summary: 'Get unread notifications for the logged‑in user',
      tags: ['Notifications'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'List of unread notifications', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Notification' } } } } },
        401: { description: 'Unauthorized' },
        500: { description: 'Server error' },
      },
    },
  },
  '/notifications/{id}/read': {
    patch: {
      summary: 'Mark a single notification as read',
      tags: ['Notifications'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Marked as read', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
        401: { description: 'Unauthorized' },
        403: { description: 'Not owner' },
        404: { description: 'Notification not found' },
        500: { description: 'Server error' },
      },
    },
  },
  '/notifications/read-all': {
    patch: {
      summary: 'Mark all unread notifications as read',
      tags: ['Notifications'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'All marked as read', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
        401: { description: 'Unauthorized' },
        500: { description: 'Server error' },
      },
    },
  },
};

// Merge paths into definition
options.definition.paths = paths;

const specs = swaggerJsdoc(options);
module.exports = specs;