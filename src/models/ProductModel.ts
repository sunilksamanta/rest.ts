import { Document } from 'mongoose';
import { BaseModel, SchemaDefinition } from '../factory/BaseModel';
import { Field, Model } from './decorators';

/**
 * Product document interface
 */
export interface ProductDocument extends Document {
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  sku: string;
}

/**
 * Product model class
 */
@Model('Product')
export class ProductModel extends BaseModel<ProductDocument> {
  @Field({ type: String, required: true })
  name!: string;

  @Field({ type: Number, required: true })
  price!: number;

  @Field({ type: String })
  description!: string;

  @Field({ type: String, required: true })
  category!: string;

  @Field({ type: Number, required: true, default: 0 })
  stock!: number;

  @Field({ type: String, required: true, unique: true })
  sku!: string;

  constructor() {
    super('Product');
  }

  protected defineSchema(): SchemaDefinition {
    // Get fields from decorators
    return Reflect.getMetadata('fields', ProductModel) || {};
  }
}

// Create and export a singleton instance
export default new ProductModel();
