import mongoose, { Document, Schema, Model as MongooseModel } from 'mongoose';

/**
 * Type for field definitions in schema
 */
export type SchemaFieldDefinition = {
  type: any;
  required?: boolean;
  unique?: boolean;
  default?: any;
  ref?: string;
  [key: string]: any;
};

/**
 * Type for schema definition
 */
export type SchemaDefinition = {
  [key: string]: SchemaFieldDefinition;
};

/**
 * Base model class that all models will extend
 */
export abstract class BaseModel<T extends Document> {
  protected _model: MongooseModel<T>;
  protected _modelName: string;
  protected _schema: Schema;
  
  /**
   * Create a new model
   * @param modelName The name of the model
   */
  constructor(modelName: string) {
    this._modelName = modelName;
    
    // Get schema definition from child class
    const schemaDefinition = this.defineSchema();
    
    // Add common fields (createdAt, updatedAt)
    this._schema = new Schema(schemaDefinition, { timestamps: true });
    
    // Add any hooks or methods
    this.setupSchema(this._schema);
    
    // Register the model
    if (mongoose.models[this._modelName]) {
      this._model = mongoose.model<T>(this._modelName);
    } else {
      this._model = mongoose.model<T>(this._modelName, this._schema);
    }
  }
  
  /**
   * Define the schema for this model (to be implemented by child classes)
   */
  protected abstract defineSchema(): SchemaDefinition;
  
  /**
   * Setup schema with hooks, methods, etc. (optional to override)
   * @param schema The mongoose schema
   */
  protected setupSchema(schema: Schema): void {
    // Default implementation does nothing
    // Child classes can override to add their own hooks, methods, etc.
  }
  
  /**
   * Create a new document
   * @param data The data to create the document with
   */
  async create(data: Partial<T>): Promise<T> {
    return await this._model.create(data);
  }
  
  /**
   * Find documents by criteria
   * @param filter The filter criteria
   */
  async find(filter: any = {}): Promise<T[]> {
    return await this._model.find(filter).exec();
  }
  
  /**
   * Find a document by ID
   * @param id The ID to find
   */
  async findById(id: string): Promise<T | null> {
    return await this._model.findById(id).exec();
  }
  
  /**
   * Find one document by criteria
   * @param filter The filter criteria
   */
  async findOne(filter: any = {}): Promise<T | null> {
    return await this._model.findOne(filter).exec();
  }
  
  /**
   * Update a document
   * @param id The ID of the document
   * @param data The data to update
   */
  async updateById(id: string, data: Partial<T>): Promise<T | null> {
    return await this._model.findByIdAndUpdate(id, data, { new: true }).exec();
  }
  
  /**
   * Delete a document
   * @param id The ID of the document
   */
  async deleteById(id: string): Promise<T | null> {
    return await this._model.findByIdAndDelete(id).exec();
  }
  
  /**
   * Get the mongoose model
   */
  get model(): MongooseModel<T> {
    return this._model;
  }
}
