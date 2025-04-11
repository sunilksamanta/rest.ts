import BaseModule from "../factory/BaseModule";
import {Controller} from "../factory/decorators";
import OrderModel from "../models/OrderModel";

class Order extends BaseModule{

    constructor() {
        super();
        // Set model for this module
        this.setModel(OrderModel);
        
        this.registerRoute({
            path: '/my-orders',
            method: 'GET',
            handler: this.myOrders
        })
    }

    @Controller()
    async myOrders(): Promise<object> {
        // In a real app, you would get user ID from authentication
        // For now, we'll just return all orders
        const orders = await OrderModel.find();
        return { orders };
    }

}

export default Order;
