import { Document, Schema } from 'mongoose';
import { BaseModel, SchemaDefinition } from '../factory/BaseModel';
import { Field, Model } from '../factory/decorators/model';

/**
 * User document interface
 */
export interface UserDocument extends Document {
  email: string;
  name: string;
  password: string;
}

/**
 * User model class
 */
@Model('User')
export class UserModel extends BaseModel<UserDocument> {
  @Field({ type: String, required: true, unique: true })
  email: string;

  @Field({ type: String, required: true })
  name: string;

  @Field({ type: String, required: true })
  password: string;

  constructor() {
    super('User');
  }

  protected defineSchema(): SchemaDefinition {
    // Get fields from decorators
    return Reflect.getMetadata('fields', UserModel) || {};
  }

  /**
   * Add additional methods or hooks
   */
  protected setupSchema(schema: Schema): void {
    // Add custom hooks or methods here if needed
  }
}

// Create and export a singleton instance
export default new UserModel();
