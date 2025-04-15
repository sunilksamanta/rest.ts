import {ControllerArgsT, CustomRouteT, HookFunction} from './types/factory';
import {Controller} from "./decorators";
import { BaseModel } from './BaseModel';

class BaseModule {
    moduleName: string = '';
    protected model?: BaseModel<any>;
    
    // Hook registries
    private beforeRequestHooks: HookFunction[] = [];
    private beforeResponseHooks: HookFunction[] = [];
    private afterResponseHooks: HookFunction[] = [];
    
    constructor() {
        this.moduleName = this.constructor.name;

        this.create = this.create.bind(this);
        this.readAll = this.readAll.bind(this);
        this.read = this.read.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        
        // Call setup method to register hooks
        this.setup();
    }
    customRoutes: CustomRouteT[] = [];

    /**
     * Set the model for this module
     * @param model The model to use
     */
    protected setModel(model: BaseModel<any>): void {
        this.model = model;
    }

    /**
     * Setup method to register hooks - can be overridden by child classes
     * or used through hook decorators
     */
    protected setup(): void {
        // Default implementation is empty
        // Child classes may override this to register hooks
    }

    /**
     * Hook registration methods
     */
    protected registerBeforeRequestHook(hook: HookFunction): void {
        this.beforeRequestHooks.push(hook);
    }
    
    protected registerBeforeResponseHook(hook: HookFunction): void {
        this.beforeResponseHooks.push(hook);
    }
    
    protected registerAfterResponseHook(hook: HookFunction): void {
        this.afterResponseHooks.push(hook);
    }
    
    /**
     * Hook getter methods for the decorator to use
     */
    getBeforeRequestHooks(): HookFunction[] {
        return this.beforeRequestHooks;
    }
    
    getBeforeResponseHooks(): HookFunction[] {
        return this.beforeResponseHooks;
    }
    
    getAfterResponseHooks(): HookFunction[] {
        return this.afterResponseHooks;
    }

    // Create operation
    @Controller()
    async create({req}: ControllerArgsT): Promise<object> {
        if (!this.model) {
            return { message: 'No model defined for ' + this.moduleName };
        }

        // Create entity using model
        const result = await this.model.create(req.body);
        return result;
    }

    // Read All operation
    @Controller()
    async readAll(): Promise<object> {
        if (!this.model) {
            return { message: 'No model defined for ' + this.moduleName };
        }

        // Get all entities using model
        const results = await this.model.find();
        return results;
    }

    // Read Single operation
    @Controller()
    async read({req}: ControllerArgsT): Promise<object> {
        if (!this.model) {
            return { message: 'No model defined for ' + this.moduleName };
        }

        // Get entity by ID using model
        const result = await this.model.findById(req.params.id);
        if (!result) {
            throw new Error('Entity not found');
        }
        return result;
    }

    // Update operation
    @Controller()
    async update({req}: ControllerArgsT): Promise<object> {
        if (!this.model) {
            return { message: 'No model defined for ' + this.moduleName };
        }

        // Update entity using model
        const result = await this.model.updateById(req.params.id, req.body);
        if (!result) {
            throw new Error('Entity not found');
        }
        return result;
    }

    // Delete operation
    @Controller()
    async delete({req}: ControllerArgsT): Promise<object> {
        if (!this.model) {
            return { message: 'No model defined for ' + this.moduleName };
        }

        // Delete entity using model
        const result = await this.model.deleteById(req.params.id);
        if (!result) {
            throw new Error('Entity not found');
        }
        return result;
    }

    // Custom operation
    protected registerRoute({ path, method, handler }: CustomRouteT): void {
        // Auto-bind the handler to this class instance
        const boundHandler = handler.bind(this);
        this.customRoutes.push({ path, method, handler: boundHandler });
    }
}

export default BaseModule;
