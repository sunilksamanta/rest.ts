#!/usr/bin/env node
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);

// Paths
const SRC_DIR = path.join(__dirname, '../src');
const MODULES_DIR = path.join(SRC_DIR, 'modules');
const MODELS_DIR = path.join(SRC_DIR, 'models');

/**
 * Main function to run the generator script
 */
async function main() {
  try {
    console.log('🚀 Auto-REST Generator');
    console.log('======================');

    // Create directories if they don't exist
    await ensureDirectoryExists(MODULES_DIR);
    await ensureDirectoryExists(MODELS_DIR);

    // Ask the user what they want to generate
    const { generatorType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'generatorType',
        message: 'What do you want to generate?',
        choices: ['Module', 'Model', 'Both Module and Model']
      }
    ]);

    // Ask for the resource name
    const { resourceName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'resourceName',
        message: 'Enter the resource name (e.g. User, Product, Order):',
        validate: (input) => {
          if (!input) return 'Resource name cannot be empty';
          if (!/^[A-Z][a-zA-Z]*$/.test(input)) {
            return 'Resource name must start with a capital letter and contain only letters';
          }
          return true;
        }
      }
    ]);

    // Depending on their choice, generate module, model, or both
    if (generatorType === 'Module' || generatorType === 'Both Module and Model') {
      await generateModule(resourceName, generatorType === 'Both Module and Model');
    } 
    
    if (generatorType === 'Model' || generatorType === 'Both Module and Model') {
      await generateModel(resourceName);
    }

    // Update package.json to include the generate script
    await updatePackageJson();

    console.log('✅ Generation complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

/**
 * Ensure a directory exists, create if it doesn't
 */
async function ensureDirectoryExists(dir) {
  if (!await exists(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

/**
 * Generate a module file
 */
async function generateModule(resourceName, generateRelatedModel) {
  const filePath = path.join(MODULES_DIR, `${resourceName}.ts`);
  
  // Check if the file already exists
  if (await exists(filePath)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `Module '${resourceName}.ts' already exists. Overwrite?`,
        default: false
      }
    ]);

    if (!overwrite) {
      console.log(`⏭️ Skipping module generation for ${resourceName}`);
      return;
    }
  }

  // Ask for custom routes if needed
  const { addCustomRoutes } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'addCustomRoutes',
      message: 'Do you want to add custom routes to this module?',
      default: true
    }
  ]);

  let customRoutes = [];
  if (addCustomRoutes) {
    let addingRoutes = true;
    
    while (addingRoutes) {
      const { path, method, handlerName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'path',
          message: 'Enter route path (e.g. /all, /search):',
          default: '/custom',
          validate: (input) => input.startsWith('/') ? true : 'Path must start with /'
        },
        {
          type: 'list',
          name: 'method',
          message: 'Select HTTP method:',
          choices: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
        },
        {
          type: 'input',
          name: 'handlerName',
          message: 'Enter handler method name:',
          default: (answers) => {
            // Generate a default name based on method and path
            const pathWithoutSlash = answers.path.substring(1);
            const methodPrefix = answers.method.toLowerCase();
            return `${methodPrefix}${pathWithoutSlash.charAt(0).toUpperCase() + pathWithoutSlash.slice(1)}`;
          },
          validate: (input) => input ? true : 'Handler name cannot be empty'
        }
      ]);

      customRoutes.push({ path, method, handlerName });

      const { addAnother } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'addAnother',
          message: 'Add another custom route?',
          default: false
        }
      ]);

      addingRoutes = addAnother;
    }
  }

  // Generate the module content
  let modelImport = '';
  let setModelLine = '';
  
  if (generateRelatedModel) {
    modelImport = `import ${resourceName}Model from "../models/${resourceName}Model";`;
    setModelLine = `this.setModel(${resourceName}Model);`;
  }

  // Create custom route registrations
  const routeRegistrations = customRoutes.map(route => {
    return `
        this.registerRoute({
            path: '${route.path}',
            method: '${route.method}',
            handler: this.${route.handlerName}
        });`;
  }).join('');

  // Create custom route handlers
  const routeHandlers = customRoutes.map(route => {
    const methodName = route.handlerName;
    let returnType = 'object';
    let handlerBody = '';

    if (generateRelatedModel) {
      handlerBody = `
        // Example implementation using the model
        const ${resourceName.toLowerCase()}s = await ${resourceName}Model.find();
        return { ${resourceName.toLowerCase()}s };`;
    } else {
      handlerBody = `
        // TODO: Implement your custom logic here
        return { message: '${methodName} not implemented yet' };`;
    }

    return `
    @Controller()
    async ${methodName}(): Promise<${returnType}> {${handlerBody}
    }`;
  }).join('\n\n');

  const moduleContent = `import BaseModule from "../factory/BaseModule";
import { Controller } from "../factory/decorators";
${modelImport}

class ${resourceName} extends BaseModule {
    constructor() {
        super();
        ${setModelLine}${routeRegistrations}
    }
${routeHandlers}
}

export default ${resourceName};
`;

  await writeFile(filePath, moduleContent);
  console.log(`✅ Module '${resourceName}.ts' has been created successfully!`);
}

/**
 * Generate a model file
 */
async function generateModel(resourceName) {
  const filePath = path.join(MODELS_DIR, `${resourceName}Model.ts`);
  
  // Check if the file already exists
  if (await exists(filePath)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `Model '${resourceName}Model.ts' already exists. Overwrite?`,
        default: false
      }
    ]);

    if (!overwrite) {
      console.log(`⏭️ Skipping model generation for ${resourceName}`);
      return;
    }
  }

  // Define fields for the model
  const fields = [];
  let addingFields = true;
  
  console.log(`\nDefining fields for ${resourceName}Model:`);
  
  while (addingFields) {
    const { fieldName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'fieldName',
        message: 'Enter field name (camelCase):',
        validate: (input) => {
          if (!input) return 'Field name cannot be empty';
          if (!/^[a-z][a-zA-Z0-9]*$/.test(input)) {
            return 'Field name must be in camelCase (start with lowercase)';
          }
          return true;
        }
      }
    ]);

    const { fieldType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'fieldType',
        message: 'Select field type:',
        choices: ['String', 'Number', 'Boolean', 'Date', 'ObjectId', 'Array', 'Mixed']
      }
    ]);

    const { isRequired, isUnique } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'isRequired',
        message: 'Is this field required?',
        default: true
      },
      {
        type: 'confirm',
        name: 'isUnique',
        message: 'Is this field unique?',
        default: false
      }
    ]);

    let defaultValue;
    if (fieldType !== 'Array' && fieldType !== 'ObjectId') {
      const { hasDefault } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'hasDefault',
          message: 'Do you want to specify a default value?',
          default: false
        }
      ]);

      if (hasDefault) {
        const { value } = await inquirer.prompt([
          {
            type: 'input',
            name: 'value',
            message: 'Enter default value:',
            validate: (input) => {
              try {
                if (fieldType === 'Number') {
                  const num = Number(input);
                  if (isNaN(num)) return 'Must be a number';
                } else if (fieldType === 'Boolean') {
                  if (input !== 'true' && input !== 'false') return 'Must be true or false';
                } else if (fieldType === 'Date' && input.toLowerCase() !== 'date.now') {
                  new Date(input); // Will throw if invalid
                }
                return true;
              } catch (e) {
                return 'Invalid value for type ' + fieldType;
              }
            }
          }
        ]);

        defaultValue = value;
      }
    }

    fields.push({
      name: fieldName,
      type: fieldType,
      required: isRequired,
      unique: isUnique,
      defaultValue
    });

    const { addAnother } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'addAnother',
        message: 'Add another field?',
        default: true
      }
    ]);

    addingFields = addAnother;
  }

  // Generate field declarations for the interface
  const interfaceFields = fields.map(field => {
    let fieldType = '';
    
    switch (field.type) {
      case 'String': fieldType = 'string'; break;
      case 'Number': fieldType = 'number'; break;
      case 'Boolean': fieldType = 'boolean'; break;
      case 'Date': fieldType = 'Date'; break;
      case 'ObjectId': fieldType = 'string'; break;  // Mongoose ObjectId becomes string in TS
      case 'Array': fieldType = 'any[]'; break;
      case 'Mixed': fieldType = 'any'; break;
      default: fieldType = 'any';
    }
    
    return `  ${field.name}${field.required ? '' : '?'}: ${fieldType};`;
  }).join('\n');

  // Generate field decorators
  const modelFields = fields.map(field => {
    let decoratorOptions= [];
    let typeStr = '';
    
    switch (field.type) {
      case 'String':
        typeStr = 'String';
        break;
      case 'Number':
        typeStr = 'Number';
        break;
      case 'Boolean':
        typeStr = 'Boolean';
        break;
      case 'Date':
        typeStr = 'Date';
        break;
      case 'ObjectId':
        typeStr = 'Schema.Types.ObjectId';
        break;
      case 'Array':
        typeStr = '[]';
        break;
      case 'Mixed':
        typeStr = 'Schema.Types.Mixed';
        break;
      default:
        typeStr = 'String';
    }
    
    decoratorOptions.push(`type: ${typeStr}`);
    
    if (field.required) {
      decoratorOptions.push('required: true');
    }
    
    if (field.unique) {
      decoratorOptions.push('unique: true');
    }
    
    if (field.defaultValue) {
      if (field.type === 'String') {
        decoratorOptions.push(`default: '${field.defaultValue}'`);
      } else if (field.type === 'Date' && field.defaultValue.toLowerCase() === 'date.now') {
        decoratorOptions.push('default: Date.now');
      } else {
        decoratorOptions.push(`default: ${field.defaultValue}`);
      }
    }
    
    return `  @Field({ ${decoratorOptions.join(', ')} })\n  ${field.name}: ${field.type.toLowerCase()};`;
  }).join('\n\n');

  // Generate the model content
  const modelContent = `import { Document, Schema } from 'mongoose';
import { BaseModel, SchemaDefinition } from '../factory/BaseModel';
import { Field, Model } from '../factory/decorators/model';

/**
 * ${resourceName} document interface
 */
export interface ${resourceName}Document extends Document {
${interfaceFields}
}

/**
 * ${resourceName} model class
 */
@Model('${resourceName}')
export class ${resourceName}Model extends BaseModel<${resourceName}Document> {
${modelFields}

  constructor() {
    super('${resourceName}');
  }

  protected defineSchema(): SchemaDefinition {
    // Get fields from decorators
    return Reflect.getMetadata('fields', ${resourceName}Model) || {};
  }

  /**
   * Add additional methods or hooks
   */
  protected setupSchema(schema: Schema): void {
    // Add custom hooks or methods here if needed
  }
}

// Create and export a singleton instance
export default new ${resourceName}Model();
`;

  await writeFile(filePath, modelContent);
  console.log(`✅ Model '${resourceName}Model.ts' has been created successfully!`);
}

/**
 * Update package.json to include the generate script
 */
async function updatePackageJson() {
  const packageJsonPath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  
  if (!packageJson.scripts['generate']) {
    packageJson.scripts['generate'] = 'node scripts/generate.js';
    await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Added "generate" script to package.json');
  }
}

// Run the main function
main().catch(console.error);
