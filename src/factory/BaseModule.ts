import {ControllerArgsT, CustomRouteT, HookFunction, HookType, HookDefinition} from './types/factory';
import {BeforeResponse, Controller} from "./decorators";
import { BaseModel } from './BaseModel';

class BaseModule {
    moduleName: string = '';
    protected model?: BaseModel<any>;

    // Hook registries as organized collections
    private beforeRequestHooks: HookDefinition[] = [];
    private beforeResponseHooks: HookDefinition[] = [];
    private afterResponseHooks: HookDefinition[] = [];

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
     * Registers a hook with specified options
     * @param hookType Type of hook (before request, before response, after response)
     * @param hook The hook function
     * @param options Additional options (priority, target method)
     */
    protected registerHook(
        hookType: HookType, 
        hook: HookFunction, 
        options: { 
            priority?: number;  // Default: 100
            target?: string;    // Target method name or undefined for global 
        } = {}
    ): void {
        const { priority = 100, target } = options;
        const hookDefinition: HookDefinition = { hook, priority, target };
        
        switch (hookType) {
            case 'beforeRequest':
                this.beforeRequestHooks.push(hookDefinition);
                // Sort by priority after adding
                this.beforeRequestHooks.sort((a, b) => a.priority - b.priority);
                break;
            case 'beforeResponse':
                this.beforeResponseHooks.push(hookDefinition);
                this.beforeResponseHooks.sort((a, b) => a.priority - b.priority);
                break;
            case 'afterResponse':
                this.afterResponseHooks.push(hookDefinition);
                this.afterResponseHooks.sort((a, b) => a.priority - b.priority);
                break;
        }
    }

    /**
     * Helper methods for registering specific hook types
     */
    protected registerBeforeRequestHook(
        hook: HookFunction, 
        options: { priority?: number; target?: string } = {}
    ): void {
        this.registerHook('beforeRequest', hook, options);
    }
    
    protected registerBeforeResponseHook(
        hook: HookFunction, 
        options: { priority?: number; target?: string } = {}
    ): void {
        this.registerHook('beforeResponse', hook, options);
    }
    
    protected registerAfterResponseHook(
        hook: HookFunction, 
        options: { priority?: number; target?: string } = {}
    ): void {
        this.registerHook('afterResponse', hook, options);
    }

    /**
     * Get hooks for a specific method or global hooks
     * @param hookArray The hook registry array
     * @param methodName The target method name
     * @returns Array of matching hooks
     */
    private getHooksForMethod(
        hookArray: HookDefinition[], 
        methodName: string
    ): HookFunction[] {
        return hookArray
            .filter(def => !def.target || def.target === methodName)
            .map(def => def.hook);
    }

    /**
     * Hook getter methods used by the controller decorator
     */
    getBeforeRequestHooks(methodName?: string): HookFunction[] {
        if (methodName) {
            return this.getHooksForMethod(this.beforeRequestHooks, methodName);
        }
        return this.beforeRequestHooks.map(def => def.hook);
    }
    
    getBeforeResponseHooks(methodName?: string): HookFunction[] {
        if (methodName) {
            return this.getHooksForMethod(this.beforeResponseHooks, methodName);
        }
        return this.beforeResponseHooks.map(def => def.hook);
    }
    
    getAfterResponseHooks(methodName?: string): HookFunction[] {
        if (methodName) {
            return this.getHooksForMethod(this.afterResponseHooks, methodName);
        }
        return this.afterResponseHooks.map(def => def.hook);
    }

    /**
     * Apply a chain of hooks to a specific controller method
     * This allows for elegant, functional-style hook composition
     * @param methodName The name of the controller method
     * @param hookChain Array of hooks to apply
     * @param type The type of hook to register these as
     */
    protected applyHooks(
        methodName: string, 
        hookChain: HookFunction[], 
        type: HookType
    ): void {
        hookChain.forEach((hook, index) => {
            this.registerHook(type, hook, { 
                target: methodName,
                priority: index * 10 + 100 // Preserve order in chain
            });
        });
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

    /**
     * BeforeResponse hook - runs after the controller method but before sending response
     * Can modify the response data
     */
    @BeforeResponse()
    async formatResponse(args: ControllerArgsT, result: any): Promise<any> {
        console.log('Formatting response...');
        
        return {
            data: result,
            timestamp: new Date().toISOString()
        };
    }
}

export default BaseModule;
