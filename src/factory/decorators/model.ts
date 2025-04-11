import 'reflect-metadata';
import { SchemaFieldDefinition } from "../BaseModel";

/**
 * Field decorator to define a property in a model
 * @param options Schema field options
 */
export function Field(options: SchemaFieldDefinition) {
  return function(target: any, propertyKey: string) {
    // Use metadata to store field options
    const fields = Reflect.getMetadata('fields', target.constructor) || {};
    fields[propertyKey] = options;
    Reflect.defineMetadata('fields', fields, target.constructor);
  };
}

/**
 * Model decorator to register a model name
 * @param name Model name (optional, will use class name if not provided)
 */
export function Model(name?: string) {
  return function(constructor: Function) {
    const modelName = name || constructor.name;
    Reflect.defineMetadata('modelName', modelName, constructor);
  };
}