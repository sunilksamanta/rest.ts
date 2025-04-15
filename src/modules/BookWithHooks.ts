import BaseModule from "../factory/BaseModule";
import { Controller, BeforeRequest, BeforeResponse, AfterResponse } from "../factory/decorators";
import BookModel from "../models/BookModel";
import { ControllerArgsT } from "../factory/types/factory";

/**
 * Enhanced Book module with hooks demonstration
 */
class BookWithHooks extends BaseModule {
    constructor() {
        super();
        // Set model for this module
        this.setModel(BookModel);

        // Register custom routes - binding the handler to preserve 'this' context
        this.registerRoute({
            path: '/names-only',
            method: 'GET',
            handler: this.getBookNames
        });

        // Direct registration of a hook (alternative to decorators)
        this.registerBeforeRequestHook(this.logAllRequests);
    }

    /**
     * Hook registered directly in constructor
     */
    async logAllRequests(args: ControllerArgsT): Promise<void> {
        console.log(`[${new Date().toISOString()}] Request to ${args.req.method} ${args.req.path}`);
    }

    /**
     * BeforeRequest hook - runs before the controller method
     * Can modify request, perform validation, or prevent execution
     */
    @BeforeRequest()
    async validateRequest(args: ControllerArgsT): Promise<boolean | void> {
        console.log('Validating request...');
        
        // Example validation - add a default parameter if needed
        if (args.req.path.includes('/names-only') && !args.req.query.format) {
            console.log('Setting default format parameter');
            args.req.query.format = 'list';
        }
        
        // Return true to continue or false to abort
        return true;
    }

    /**
     * BeforeResponse hook - runs after the controller method but before sending response
     * Can modify the response data
     */
    @BeforeResponse()
    async formatResponse(args: ControllerArgsT, result: any): Promise<any> {
        console.log('Formatting response...');
        
        return { 
            items: result, 
            count: result.length,
            formatted: true,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * AfterResponse hook - runs after the response has been sent
     * Use for logging, analytics, cleanup, etc.
     */
    @AfterResponse()
    async logResponse(args: ControllerArgsT, result: any): Promise<void> {
        console.log(`Response sent for ${args.req.method} ${args.req.path}`);
        
        // Example: Log response time
        const startTime = args.req.get('X-Request-Start-Time') || Date.now();
        const responseTime = Date.now() - Number(startTime);
        console.log(`Response time: ${responseTime}ms`);
    }

    /**
     * Controller method using hooks
     */
    @Controller()
    async getBookNames({ req, res }: ControllerArgsT): Promise<string[]> {
        console.log('Executing getBookNames controller method');
        
        // Use model to get real data
        const books = await BookModel.find();
        
        // Set a header for demonstration
        res.set('X-Total-Count', books.length.toString());
        
        return books.map(book => book.title);
    }
}

export default BookWithHooks;
