import BaseModule from "../factory/BaseModule";
import {Controller} from "../factory/decorators";
import BookModel from "../models/BookModel";

class Book extends BaseModule {
    constructor() {
        super();
        // Set model for this module
        this.setModel(BookModel);

        this.registerRoute({
            path: '/names-only',
            method: 'GET',
            handler: this.getBookNames
        })

    }

    @Controller()
    async getBookNames(): Promise<string[]> {
        // Use model to get real data
        const books = await BookModel.find();
        return books.map(book => book.title);
    }
}

export default Book;
