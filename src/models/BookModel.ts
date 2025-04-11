import { Document } from 'mongoose';
import { BaseModel, SchemaDefinition } from '../factory/BaseModel';
import { Field, Model } from '../factory/decorators/model';

/**
 * Book document interface
 */
export interface BookDocument extends Document {
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  price: number;
  description?: string;
}

/**
 * Book model class
 */
@Model('Book')
export class BookModel extends BaseModel<BookDocument> {
  @Field({ type: String, required: true })
  title: string;

  @Field({ type: String, required: true })
  author: string;

  @Field({ type: String, required: true, unique: true })
  isbn: string;

  @Field({ type: Number, required: true })
  publishedYear: number;

  @Field({ type: Number, required: true })
  price: number;

  @Field({ type: String })
  description: string;

  constructor() {
    super('Book');
  }

  protected defineSchema(): SchemaDefinition {
    // Get fields from decorators
    return Reflect.getMetadata('fields', BookModel) || {};
  }
}

// Create and export a singleton instance
export default new BookModel();
