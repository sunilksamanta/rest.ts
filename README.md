# rest.ts

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Documentation](https://img.shields.io/badge/Documentation-latest-blue.svg)](DOCUMENTATION.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green.svg)](https://www.mongodb.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

A TypeScript-based Node.js framework for automatically generating RESTful APIs with MongoDB integration.

## Overview

rest.ts is a productive framework designed to streamline the development of RESTful APIs in Node.js using TypeScript. It leverages MongoDB through Mongoose, and provides a seamless way to generate and manage API modules with complete CRUD operations.

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
git clone https://github.com/sunilksamanta/rest.ts.git

# Navigate to the project directory
cd rest.ts

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

### 1. Configure Environment Variables

1. Copy the example environment file to create your own:

```bash
cp .env.example .env
```

2. Modify the `.env` file with your specific configuration:
   - Set your MongoDB connection URI
   - Configure server port
   - Adjust other settings as needed

### 2. Configure MongoDB

Make sure MongoDB is running on your local machine or update the connection URI in your `.env` file.

### 2. Generate Modules

This framework includes a powerful generator to create modules, models, and custom routes. To use the generator:

```bash
npm run generate
```

This will start an interactive CLI that guides you through creating:
- Model (database schema)
- Module (controller with routes)
- Both Module and Model at once
- Custom Route for an existing module

The generator prompts you for:
- Resource name (for modules and models)
- Fields and their types (for models)
- Custom routes and handlers
- Route paths, HTTP methods, and handler names
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

You have three ways to add custom routes to your modules:

### 1. Using the Generator Script

The easiest way is to use the generator script's dedicated "Custom Route" option:

```bash
npm run generate
# Then select "Custom Route" from the menu
```

This interactive process will:
1. Let you select an existing module
2. Define the route path (e.g., `/search`, `/export`)
3. Choose the HTTP method (GET, POST, PUT, PATCH, DELETE)
4. Name the handler method
5. Automatically add the route to the selected module

### 2. During Module Generation

When creating a new module, the generator will ask if you want to add custom routes and guide you through setting them up.

### 3. Manual Addition

You can also manually edit the module file to add custom routes:

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
