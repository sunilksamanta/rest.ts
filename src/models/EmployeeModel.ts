import { Document } from 'mongoose';
import { BaseModel, SchemaDefinition } from '../factory/BaseModel';
import { Field, Model } from './decorators';

/**
 * Employee document interface
 */
export interface EmployeeDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  salary: number;
  hireDate: Date;
}

/**
 * Employee model class
 */
@Model('Employee')
export class EmployeeModel extends BaseModel<EmployeeDocument> {
  @Field({ type: String, required: true })
  firstName!: string;

  @Field({ type: String, required: true })
  lastName!: string;

  @Field({ type: String, required: true, unique: true })
  email!: string;

  @Field({ type: String, required: true })
  position!: string;

  @Field({ type: String, required: true })
  department!: string;

  @Field({ type: Number, required: true })
  salary!: number;

  @Field({ type: Date, default: Date.now })
  hireDate!: Date;

  constructor() {
    super('Employee');
  }

  protected defineSchema(): SchemaDefinition {
    // Get fields from decorators
    return Reflect.getMetadata('fields', EmployeeModel) || {};
  }
}

// Create and export a singleton instance
export default new EmployeeModel();
