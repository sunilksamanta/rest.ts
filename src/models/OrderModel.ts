import { Document, Schema } from 'mongoose';
import { BaseModel, SchemaDefinition } from '../factory/BaseModel';
import { Field, Model } from '../factory/decorators/model';

/**
 * Order item interface
 */
interface OrderItem {
  product: string;  // Product ID
  quantity: number;
  price: number;
}

/**
 * Order document interface
 */
export interface OrderDocument extends Document {
  customer: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  orderDate: Date;
  shippingAddress: string;
}

/**
 * Order model class
 */
@Model('Order')
export class OrderModel extends BaseModel<OrderDocument> {
  @Field({ type: String, required: true })
  customer: string;

  @Field({
    type: [{
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }],
    required: true
  })
  items: OrderItem[];

  @Field({ type: Number, required: true })
  totalAmount: number;

  @Field({ type: String, required: true, default: 'pending', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] })
  status: string;

  @Field({ type: Date, default: Date.now })
  orderDate: Date;

  @Field({ type: String, required: true })
  shippingAddress: string;

  constructor() {
    super('Order');
  }

  protected defineSchema(): SchemaDefinition {
    // Get fields from decorators
    return Reflect.getMetadata('fields', OrderModel) || {};
  }

  /**
   * Add additional methods or hooks
   */
  protected setupSchema(schema: Schema): void {
    // Add a pre-save hook to calculate total amount if not provided
    schema.pre('save', function(next) {
      // Use type assertion with unknown first to avoid direct casting error
      const order = this as unknown as OrderDocument;
      if (!order.totalAmount && order.items?.length) {
        order.totalAmount = order.items.reduce((total, item) => {
          return total + (item.price * item.quantity);
        }, 0);
      }
      next();
    });
  }
}

// Create and export a singleton instance
export default new OrderModel();
