/**
 * Hook decorators for controller methods
 */
import { HookFunction } from "../types/factory";

/**
 * Decorator to mark a method as a before request hook.
 * This hook runs before the controller method executes.
 * 
 * @param options Optional configuration for the hook
 * @returns Method decorator function
 */
export function BeforeRequest(options: { 
    priority?: number;
    target?: string;   // Target controller method or undefined for global
} = {}) {
    return function(
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value as HookFunction;
        
        // Store original setup for later use
        const originalSetup = target.constructor.prototype.setup || function() {};
        
        // Override the setup method to register this hook
        target.constructor.prototype.setup = function() {
            // Call the original setup first
            originalSetup.apply(this);
            
            // Register this method as a hook with options
            this.registerBeforeRequestHook(originalMethod.bind(this), options);
        };
        
        return descriptor;
    };
}

/**
 * Decorator to mark a method as a before response hook.
 * This hook runs after the controller method executes but before the response is sent.
 * It can modify the response data.
 * 
 * @param options Optional configuration for the hook
 * @returns Method decorator function
 */
export function BeforeResponse(options: {
    priority?: number;
    target?: string;   // Target controller method or undefined for global
} = {}) {
    return function(
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value as HookFunction;
        
        const originalSetup = target.constructor.prototype.setup || function() {};
        
        target.constructor.prototype.setup = function() {
            originalSetup.apply(this);
            this.registerBeforeResponseHook(originalMethod.bind(this), options);
        };
        
        return descriptor;
    };
}

/**
 * Decorator to mark a method as an after response hook.
 * This hook runs after the response has been sent to the client.
 * It cannot modify the response, but can perform cleanup or logging tasks.
 * 
 * @param options Optional configuration for the hook
 * @returns Method decorator function
 */
export function AfterResponse(options: {
    priority?: number;
    target?: string;   // Target controller method or undefined for global
} = {}) {
    return function(
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value as HookFunction;
        
        const originalSetup = target.constructor.prototype.setup || function() {};
        
        target.constructor.prototype.setup = function() {
            originalSetup.apply(this);
            this.registerAfterResponseHook(originalMethod.bind(this), options);
        };
        
        return descriptor;
    };
}
