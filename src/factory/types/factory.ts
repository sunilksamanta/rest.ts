import { NextFunction, Request, Response } from "express";
export type RestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export interface ControllerArgsT {
    req: Request;
    res: Response;
    next: NextFunction
}
export interface CustomRouteT { path: string, method: RestMethod, handler: ({ req, res, next }: ControllerArgsT) => Promise<unknown> }

/**
 * Hook function type for controller hooks
 * @param args The controller arguments (request, response, next)
 * @param result Optional result from the controller (for beforeResponse and afterResponse hooks)
 * @returns Modified result or void, or false to stop processing
 */
export type HookFunction = (args: ControllerArgsT, result?: any) => Promise<any>;
