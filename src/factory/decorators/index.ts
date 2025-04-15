/**
 * Decorators for the factory pattern
 */

import {Request, Response, NextFunction} from "express";
import { ControllerArgsT, HookFunction } from "../types/factory";

// Export hook decorators
export { BeforeRequest, BeforeResponse, AfterResponse } from './hooks';

/**
 * A decorator for controller methods in an Express application.
 *
 * This decorator wraps the original method to handle HTTP requests and responses.
 * It ensures that the method's result is sent as a JSON response and any errors
 * are passed to the next middleware for error handling.
 * 
 * It also handles the execution of hooks:
 * - beforeRequest: Run before the controller method
 * - beforeResponse: Run after the controller method but before sending response
 * - afterResponse: Run after sending the response
 *
 * @returns {Function} A function that modifies the method descriptor.
 * @constructor
 */
function Controller(): (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor {
    return function (
        target: unknown,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
            try {
                // Create controller args object
                const controllerArgs: ControllerArgsT = { req, res, next };
                const self = this as any; // Cast to any to access hook methods
                // Execute beforeRequest hooks if they exist
                if (typeof self.getBeforeRequestHooks === 'function') {
                    // Pass the method name to get method-specific hooks too
                    const beforeHooks: HookFunction[] = self.getBeforeRequestHooks(propertyKey);
                    for (const hook of beforeHooks) {
                        // Allow hooks to modify the request or prevent execution
                        const hookResult = await hook(controllerArgs);
                        if (hookResult === false) {
                            // If hook returns false, stop processing
                            return;
                        }
                    }
                }
                
                // Execute the controller method
                const result = await originalMethod.apply(this, [controllerArgs]);
                
                // Execute beforeResponse hooks that can modify the result
                let modifiedResult = result;
                if (typeof self.getBeforeResponseHooks === 'function') {
                    // Pass the method name to get method-specific hooks too
                    const beforeResponseHooks: HookFunction[] = self.getBeforeResponseHooks(propertyKey);
                    for (const hook of beforeResponseHooks) {
                        // Allow hooks to modify the response
                        const hookResult = await hook(controllerArgs, modifiedResult);
                        if (hookResult !== undefined) {
                            modifiedResult = hookResult;
                        }
                    }
                }
                
                // Send the response
                res.json(modifiedResult);
                
                // Execute afterResponse hooks
                if (typeof self.getAfterResponseHooks === 'function') {
                    // Pass the method name to get method-specific hooks too
                    const afterHooks: HookFunction[] = self.getAfterResponseHooks(propertyKey);
                    for (const hook of afterHooks) {
                        // These hooks can't modify the response as it's already sent
                        await hook(controllerArgs, modifiedResult);
                    }
                }
            } catch (error) {
                console.error('Error in controller method:', error);
                if (error instanceof Error) {
                    res.status(500).json({error: error.message, status: 'error'});
                } else if (typeof error === 'string') {
                    res.status(500).json({error, status: 'error'});
                } else {
                    res.status(500).json({error: 'An unknown error occurred', status: 'error'});
                }
            }
        };

        return descriptor;
    };
}

export { Controller };
