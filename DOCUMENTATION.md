# rest.ts Documentation

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Core Concepts](#core-concepts)
  - [Modules](#modules)
  - [Models](#models)
  - [Decorators](#decorators)
  - [Routes](#routes)
  - [Hooks](#hooks)
- [Getting Started](#getting-started)
  - [Creating a New Project](#creating-a-new-project)
  - [Setting Up MongoDB](#setting-up-mongodb)
  - [Environment Variables](#environment-variables)
- [Code Generator](#code-generator)
  - [Creating Models](#creating-models)
  - [Creating Modules](#creating-modules)
  - [Adding Custom Routes](#adding-custom-routes)
- [Project Structure](#project-structure)
- [Advanced Usage](#advanced-usage)
  - [Custom Schema Hooks](#custom-schema-hooks)
  - [Extending Base Classes](#extending-base-classes)
  - [Authentication](#authentication)
  - [Error Handling](#error-handling)
- [API Reference](#api-reference)
  - [BaseModule](#basemodule)
  - [BaseModel](#basemodel)
  - [Decorators](#decorators-api)
- [Examples](#examples)
  - [Basic CRUD](#basic-crud)
  - [Custom Routes](#custom-routes-example)
  - [Custom Validations](#custom-validations)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Introduction

rest.ts is a TypeScript-based Node.js framework designed to streamline the development of RESTful APIs with MongoDB integration. It uses a module-based architecture and leverages TypeScript decorators to create a clean, maintainable codebase.

Key features:
- 🚀 Automatic REST API generation
- 🧩 Module-based architecture
- 📝 TypeScript support
- 📦 Mongoose integration
- 🛠️ Customizable routes and controllers
- 🪝 Powerful request/response lifecycle hooks
- 🔧 CLI tool for code generation

## Installation

### Prerequisites

Before installing rest.ts, make sure you have the following installed:

- Node.js (v18.x or higher)
- MongoDB (v6.x or higher)
- TypeScript (v5.5.x or higher)

### Setting up a new project

```bash
# Clone the repository
git clone https://github.com/sunilksamanta/rest.ts.git

# Navigate to the project directory
cd rest.ts

# Install dependencies
npm install

# Copy the example environment file
cp .env.example .env
```

### Installing in an existing project

```bash
# Install the package
npm install rest.ts

# Install peer dependencies
npm install mongoose express reflect-metadata
```

## Core Concepts

### Modules

Modules are the core building blocks of a rest.ts application. Each module represents a resource in your API (like Users, Products, Orders, etc.) and contains the logic for handling requests related to that resource.

A module typically:
- Extends the `BaseModule` class
- Is associated with a model
- Handles CRUD operations for the resource
- Can contain custom route handlers

```typescript
// Example of a module
import BaseModule from "../factory/BaseModule";
import { Controller } from "../factory/decorators";
import UserModel from "../models/UserModel";

class User extends BaseModule {
    constructor() {
        super();
        // Set model for this module
        this.setModel(UserModel);
        
        // Register custom routes
        this.registerRoute({
            path: '/active',
            method: 'GET',
            handler: this.getActiveUsers
        });
    }

    @Controller()
    async getActiveUsers(): Promise<object> {
        const users = await UserModel.find({ status: 'active' });
        return users;
    }
}

export default User;
```

### Models

Models define the schema for your MongoDB documents and provide methods for interacting with the database. Each model:
- Extends the `BaseModel` class
- Uses TypeScript decorators to define fields
- Provides a strongly-typed interface for your data
- Can include custom methods and hooks

```typescript
// Example of a model
import { Document, Schema } from 'mongoose';
import { BaseModel, SchemaDefinition } from '../factory/BaseModel';
import { Field, Model } from '../factory/decorators/model';

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Model('User')
export class UserModel extends BaseModel<UserDocument> {
  @Field({ type: String, required: true })
  name: string;

  @Field({ type: String, required: true, unique: true })
  email: string;

  @Field({ type: String, required: true })
  password: string;

  @Field({ type: Boolean, default: true })
  isActive: boolean;

  constructor() {
    super('User');
  }

  protected defineSchema(): SchemaDefinition {
    return Reflect.getMetadata('fields', UserModel) || {};
  }

  protected setupSchema(schema: Schema): void {
    // Add pre-save hook for password hashing
    schema.pre('save', function(next) {
      // Example: Hash password
      next();
    });
  }
}

export default new UserModel();
```

### Decorators

rest.ts uses TypeScript decorators to simplify development:

#### Controller Decorator

The `@Controller()` decorator wraps method handlers to handle HTTP requests and responses properly:

```typescript
@Controller()
async getUsers(): Promise<object> {
    // Method logic
    return { users: [] };
}
```

#### Model Decorators

- `@Model(name)`: Registers a model with an optional name
- `@Field(options)`: Defines a field in the model's schema

```typescript
@Field({ type: String, required: true, unique: true })
email: string;
```

### Routes

rest.ts automatically creates five standard RESTful routes for each module:

| HTTP Method | Path             | Handler  | Description               |
|------------|------------------|----------|---------------------------|
| GET        | /:resource       | readAll  | Get all resources         |
| GET        | /:resource/:id   | read     | Get a specific resource   |
| POST       | /:resource       | create   | Create a new resource     |
| PUT        | /:resource/:id   | update   | Update a specific resource|
| DELETE     | /:resource/:id   | delete   | Delete a specific resource|

Custom routes can be added using the `registerRoute` method:

```typescript
this.registerRoute({
    path: '/custom-path',
    method: 'GET', // 'GET', 'POST', 'PUT', 'PATCH', or 'DELETE'
    handler: this.customHandler
});
```

### Hooks

Hooks provide a powerful way to intercept and modify the request/response lifecycle in your API endpoints. They enable you to execute code at specific points during request processing without modifying the controller logic itself.

There are three types of hooks in rest.ts:

1. **BeforeRequest Hooks**: Execute before the controller method runs
   - Can validate request data, authenticate users, or modify the request
   - Can abort the request by returning `false`
   - Run in priority order (lower number = higher priority)

2. **BeforeResponse Hooks**: Execute after the controller method but before sending the response
   - Can transform or enrich the response data
   - Return a modified value to change the response

3. **AfterResponse Hooks**: Execute after the response has been sent to the client
   - Used for logging, analytics, cleanup operations, etc.
   - Cannot modify the response (as it's already sent)

Hooks can be registered in two ways:

#### Registering Hooks with Decorators

```typescript
// Hook that runs before a specific controller method
@BeforeRequest({target: 'getBookNames', priority: 10})
async validateRequest(args: ControllerArgsT): Promise<boolean | void> {
    console.log('Validating request...');
    
    // Return false to abort or true/void to continue
    if (!args.req.query.valid) {
        args.res.status(400).json({error: 'Invalid request'});
        return false;
    }
    return true;
}

// Hook that modifies the response
@BeforeResponse({target: 'getBookNames'})
async formatResponse(args: ControllerArgsT, result: any): Promise<any> {
    return {
        items: result,
        count: result.length,
        timestamp: new Date().toISOString()
    };
}

// Hook that runs after response is sent
@AfterResponse()
async logResponse(args: ControllerArgsT, result: any): Promise<void> {
    console.log(`Response sent for ${args.req.method} ${args.req.path}`);
}
```

#### Registering Hooks Programmatically

```typescript
constructor() {
    super();
    // Register a global hook with default priority (100)
    this.registerBeforeRequestHook(this.logAllRequests);
    
    // Register a hook for a specific method with custom priority
    this.registerBeforeResponseHook(this.formatBookNames, { 
        target: 'getBookNames', 
        priority: 10 
    });
}

async logAllRequests(args: ControllerArgsT): Promise<void> {
    console.log(`Request to ${args.req.method} ${args.req.path}`);
}

async formatBookNames(args: ControllerArgsT, result: any): Promise<any> {
    return { data: result, formatted: true };
}
```

#### Hook Priority and Execution Order

Hooks execute in priority order, with lower numbers running first:
- Default priority is 100
- Multiple hooks at the same priority level run in the order they were registered
- Global hooks (without a target) run for all controller methods
- Target-specific hooks run only for the specified controller method

## Getting Started

### Creating a New Project

To start a new rest.ts project:

1. Clone the repository or install the package
2. Configure your environment variables
3. Set up your MongoDB connection
4. Create models and modules
5. Run the application

### Setting Up MongoDB

1. Ensure MongoDB is installed and running on your machine
2. Update the MongoDB connection URI in your `.env` file:

```
MONGODB_URI=mongodb://localhost:27017/your-database-name
```

### Environment Variables

Create a `.env` file in your project root with the following variables:

```
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/your-database-name

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Code Generator

rest.ts includes a powerful CLI tool to generate modules, models, and custom routes.

To use the generator, run:

```bash
npm run generate
```

The generator provides an interactive CLI with the following options:

1. Module - Creates a new module
2. Model - Creates a new model
3. Both Module and Model - Creates both a module and its corresponding model
4. Custom Route - Adds a custom route to an existing module

### Creating Models

When creating a model, the generator will prompt you for:

1. Resource name (e.g., User, Product)
2. Fields:
   - Field name
   - Field type (String, Number, Boolean, Date, ObjectId, Array, Mixed)
   - Field requirements (required, unique)
   - Default values

```
npm run generate
# Select 'Model'
# Enter resource name 'Product'
# Define fields
```

This generates a model file in `src/models/ProductModel.ts`.

### Creating Modules

When creating a module, the generator will prompt you for:

1. Resource name (e.g., User, Product)
2. Whether to add custom routes
3. For each custom route:
   - Route path
   - HTTP method
   - Handler name

```
npm run generate
# Select 'Module'
# Enter resource name 'Product'
# Define custom routes
```

This generates a module file in `src/modules/Product.ts`.

### Adding Custom Routes

To add a custom route to an existing module:

```
npm run generate
# Select 'Custom Route'
# Select the module to add the route to
# Enter route details
```

## Project Structure

A typical rest.ts project follows this structure:

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

## Advanced Usage

### Custom Schema Hooks

You can customize your model's schema by overriding the `setupSchema` method:

```typescript
protected setupSchema(schema: Schema): void {
  // Add pre-save hook
  schema.pre('save', function(next) {
    // Custom logic
    next();
  });
  
  // Add custom methods
  schema.methods.customMethod = function() {
    // Custom functionality
  };
  
  // Add custom statics
  schema.statics.findByEmail = function(email: string) {
    return this.find({ email });
  };
}
```

### Extending Base Classes

You can extend the base classes to add common functionality across your application:

```typescript
// Create a custom base module with authentication
import BaseModule from "../factory/BaseModule";

class AuthenticatedModule extends BaseModule {
  constructor() {
    super();
    
    // Override default routes to add authentication
    this.create = this.authenticatedCreate.bind(this);
    // ... override other methods
  }
  
  async authenticatedCreate({ req, res, next }: ControllerArgsT): Promise<object> {
    // Check authentication
    if (!req.headers.authorization) {
      throw new Error('Unauthorized');
    }
    
    // Call the original method
    return super.create({ req, res, next });
  }
}
```

### Authentication

While rest.ts doesn't include authentication out of the box, you can easily add it:

```typescript
// Add middleware to your express app
import express from 'express';
const app = express();

// Authentication middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Verify token
  try {
    // JWT verification logic
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Apply middleware to protected routes
app.use('/admin', authMiddleware);
```

### Error Handling

rest.ts includes basic error handling in the `@Controller()` decorator. You can extend this by adding custom middleware:

```typescript
// Custom error handling middleware
function errorHandler(err, req, res, next) {
  console.error(err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors,
      status: 'error'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    status: 'error'
  });
}

// Add to your Express app
app.use(errorHandler);
```

## API Reference

### BaseModule

The `BaseModule` class provides the foundation for all modules:

#### Properties
- `moduleName`: The name of the module
- `customRoutes`: Array of custom routes

#### Methods
- `constructor()`: Initializes the module
- `setModel(model)`: Sets the model for this module
- `create({ req, res, next })`: Creates a new entity
- `readAll()`: Retrieves all entities
- `read({ req })`: Retrieves a specific entity by ID
- `update({ req })`: Updates a specific entity
- `delete({ req })`: Deletes a specific entity
- `registerRoute({ path, method, handler })`: Registers a custom route

### BaseModel

The `BaseModel` class provides the foundation for all models:

#### Properties
- `_model`: The Mongoose model
- `_modelName`: The name of the model
- `_schema`: The Mongoose schema

#### Methods
- `constructor(modelName)`: Initializes the model
- `defineSchema()`: Abstract method for defining the schema
- `setupSchema(schema)`: Hook for customizing the schema
- `create(data)`: Creates a new document
- `find(filter)`: Finds documents matching the filter
- `findById(id)`: Finds a document by ID
- `findOne(filter)`: Finds one document matching the filter
- `updateById(id, data)`: Updates a document by ID
- `deleteById(id)`: Deletes a document by ID

### Decorators API

#### @Controller()
Wraps a method to handle HTTP requests and responses:
```typescript
@Controller()
async methodName(): Promise<any> {
  // Method implementation
}
```

#### @Model(name)
Registers a model with an optional name:
```typescript
@Model('User')
class UserModel extends BaseModel<UserDocument> {
  // Model implementation
}
```

#### @Field(options)
Defines a field in the model's schema:
```typescript
@Field({ type: String, required: true })
name: string;
```

## Examples

### Basic CRUD

Here's an example of basic CRUD operations:

```typescript
// src/models/TodoModel.ts
import { Document } from 'mongoose';
import { BaseModel, SchemaDefinition } from '../factory/BaseModel';
import { Field, Model } from '../factory/decorators/model';

export interface TodoDocument extends Document {
  title: string;
  completed: boolean;
}

@Model('Todo')
export class TodoModel extends BaseModel<TodoDocument> {
  @Field({ type: String, required: true })
  title: string;

  @Field({ type: Boolean, default: false })
  completed: boolean;

  constructor() {
    super('Todo');
  }

  protected defineSchema(): SchemaDefinition {
    return Reflect.getMetadata('fields', TodoModel) || {};
  }
}

export default new TodoModel();

// src/modules/Todo.ts
import BaseModule from "../factory/BaseModule";
import TodoModel from "../models/TodoModel";

class Todo extends BaseModule {
    constructor() {
        super();
        this.setModel(TodoModel);
    }
}

export default Todo;
```

This sets up the following routes automatically:
- `GET /todos` - Get all todos
- `GET /todos/:id` - Get a specific todo
- `POST /todos` - Create a new todo
- `PUT /todos/:id` - Update a todo
- `DELETE /todos/:id` - Delete a todo

### Custom Routes Example

Adding custom routes to a module:

```typescript
// src/modules/User.ts
import BaseModule from "../factory/BaseModule";
import { Controller } from "../factory/decorators";
import UserModel from "../models/UserModel";

class User extends BaseModule {
    constructor() {
        super();
        this.setModel(UserModel);
        
        // Register custom routes
        this.registerRoute({
            path: '/search',
            method: 'GET',
            handler: this.searchUsers
        });
        
        this.registerRoute({
            path: '/activate/:id',
            method: 'PUT',
            handler: this.activateUser
        });
    }

    @Controller()
    async searchUsers({ req }): Promise<object> {
        const { query } = req.query;
        const users = await UserModel.find({
            $or: [
                { name: new RegExp(query, 'i') },
                { email: new RegExp(query, 'i') }
            ]
        });
        return users;
    }

    @Controller()
    async activateUser({ req }): Promise<object> {
        const { id } = req.params;
        const user = await UserModel.updateById(id, { isActive: true });
        return user;
    }
}

export default User;
```

### Custom Validations

Adding custom validations to a model:

```typescript
// src/models/UserModel.ts
protected setupSchema(schema: Schema): void {
  // Add email validation
  schema.path('email').validate(async function(email: string) {
    const count = await mongoose.models.User.countDocuments({ email });
    return count === 0;
  }, 'Email already exists');
  
  // Add minimum length validation
  schema.path('password').validate(function(password: string) {
    return password.length >= 8;
  }, 'Password must be at least 8 characters');
}
```

## Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Check if MongoDB is running
- Verify the connection URI in your `.env` file
- Ensure proper network access and firewall settings

**TypeScript Compilation Errors**
- Make sure `experimentalDecorators` is enabled in `tsconfig.json`
- Check for type mismatches in your code
- Run `tsc` to see detailed error messages

**Custom Routes Not Working**
- Ensure the module is correctly imported in `index.ts`
- Check that the route path is formatted correctly (starts with '/')
- Verify that the handler is correctly bound to `this`

### Debug Mode

Set `NODE_ENV=development` in your `.env` file to enable more detailed logging:

```
NODE_ENV=development
```

## Contributing

We welcome contributions to rest.ts! Please read our [Contributing Guide](CONTRIBUTING.md) for details on the code of conduct and the process for submitting pull requests.
