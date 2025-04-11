# nodejs-ts-auto-rest

A TypeScript-based Node.js framework for automatically generating RESTful APIs with MongoDB integration.

## Overview

nodejs-ts-auto-rest is a productive framework designed to streamline the development of RESTful APIs in Node.js using TypeScript. It leverages MongoDB through Mongoose, and provides a seamless way to generate and manage API modules with complete CRUD operations.

Key features:
- 🚀 Automatic REST API generation
- 🧩 Module-based architecture
- 📝 TypeScript support
- 📦 Mongoose integration
- 🛠️ Customizable routes and controllers
- 🔧 CLI tool for code generation

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nodejs-ts-auto-rest.git

# Navigate to the project directory
cd nodejs-ts-auto-rest

# Install dependencies
npm install
```

## Project Structure

```
src/
  ├── db/               # Database connection logic
  ├── factory/          # Core factory patterns and base classes
  │   ├── decorators/   # TypeScript decorators
  │   └── types/        # Type definitions
  ├── models/           # MongoDB models
  ├── modules/          # API modules/controllers
  └── index.ts          # Application entry point
```

## Getting Started

### 1. Configure MongoDB

Make sure MongoDB is running on your local machine or update the connection URI in `src/db/connection.ts`.

### 2. Generate Modules

This framework includes a powerful generator to create modules and models. To use the generator:

```bash
npm run generate
```

This will start an interactive CLI that guides you through creating:
- Model (database schema)
- Module (controller with routes)
- Or both at once

The generator prompts you for:
- Resource name
- Fields and their types
- Custom routes and handlers
- And more

### 3. Start the Server

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## Using Auto-Generated APIs

Once your module is generated, the following routes are automatically available:

| HTTP Method | Endpoint          | Action                     |
|------------|-------------------|----------------------------|
| GET        | /:resource        | Get all resources          |
| GET        | /:resource/:id    | Get a specific resource    |
| POST       | /:resource        | Create a new resource      |
| PUT        | /:resource/:id    | Update a specific resource |
| DELETE     | /:resource/:id    | Delete a specific resource |

For example, if you create a `Product` module, these routes will be available:
- `GET /products`
- `GET /products/123`
- `POST /products`
- `PUT /products/123`
- `DELETE /products/123`

Plus any custom routes you define during generation.

## Custom Routes

You can add custom routes to your modules during generation or by manually editing the module file:

```typescript
constructor() {
    super();
    this.setModel(YourModel);
    
    this.registerRoute({
        path: '/custom-path',
        method: 'GET',
        handler: this.yourCustomHandler
    });
}

@Controller()
async yourCustomHandler(): Promise<object> {
    // Your custom logic here
    return { data: 'Your custom response' };
}
```

## Advanced Usage

### Custom Schema Configuration

You can customize your model's schema by overriding the `setupSchema` method:

```typescript
protected setupSchema(schema: Schema): void {
    schema.pre('save', function(next) {
        // Custom pre-save logic
        next();
    });
    
    // Add custom methods
    schema.methods.customMethod = function() {
        // Custom functionality
    };
}
```

### Using Decorators

The framework provides decorators to simplify development:

```typescript
// Field decorator for model properties
@Field({ type: String, required: true, unique: true })
email: string;

// Controller decorator for request handlers
@Controller()
async customEndpoint(): Promise<object> {
    // Your endpoint logic
}
```

## License

MIT

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on the code of conduct and the process for submitting pull requests.
