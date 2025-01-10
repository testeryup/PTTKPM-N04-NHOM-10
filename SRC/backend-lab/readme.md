backend-lab/
├── src/
│   ├── config/
│   │   ├── db.config.js        # Database configuration
│   │   └── jwt.config.js       # JWT configuration
│   ├── models/
│   │   ├── user.model.js       # User schema
│   │   ├── product.model.js    # Product schema
│   │   ├── order.model.js      # Order schema
│   │   ├── inventory.model.js  # Digital accounts inventory
│   │   └── transaction.model.js # Financial transactions
│   ├── controllers/
│   │   ├── auth.controller.js  # Authentication
│   │   ├── user.controller.js  # User management
│   │   ├── product.controller.js
│   │   ├── order.controller.js
│   │   └── admin.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── product.routes.js
│   │   ├── order.routes.js
│   │   └── admin.routes.js
│   ├── middlewares/
│   │   ├── auth.middleware.js  # JWT verification
│   │   └── role.middleware.js  # Role-based access
│   ├── utils/
│   │   ├── jwt.utils.js       # JWT helper functions
│   │   └── validation.js      # Input validation
│   └── server.js
├── .env
└── package.json