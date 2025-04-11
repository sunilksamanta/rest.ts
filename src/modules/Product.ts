import BaseModule from "../factory/BaseModule";
import {Controller} from "../factory/decorators";
import ProductModel from "../models/ProductModel";

class Product extends BaseModule {

    constructor() {
        super();
        // Set model for this module
        this.setModel(ProductModel);
        
        this.registerRoute({ path: '/all', method: 'GET', handler: this.getAll });
    }

    @Controller()
    async getAll(): Promise<object> {
        // Fetch all products from database
        const products = await ProductModel.find();
        return { products };
    }

}

export default Product;
