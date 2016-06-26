/**
 * Express middleware Seneca library
 *
 * Allows for triggering Seneca actions based on express request properties
 */

/// <reference path="typings/globals/express/index.d.ts"/>
/// <reference path="typings/globals/seneca-node/index.d.ts"/>

import { Request, Response, NextFunction } from "express";
import { ISeneca, IPlugin } from "seneca";
import { pick } from "lodash";
const jsonic = require("jsonic");

export interface IMessage {
  req$?: Request;
  res$?: Response;
}

export interface IRouteOptions {
  pin?: string | { [key: string]: any };
  query?: string[] | boolean;
  body?: string[] | boolean;
  params?: string[] | boolean;
  response?: (req: Request, res: Response, err: any, message: IMessage) => void;
  handler?: <T>(req: Request, res: Response, message: IMessage, action: any, respond: (err: any, message: T) => void) => void;
}

export interface IRouteExport {
  (options: IRouteOptions): void;
}

const defaultOptions: IRouteOptions = {
  params: true,
};

const pliny: IPlugin<IRouteOptions> = plugin;
pliny.preload = plugin;

export { pliny };

function plugin(options: IRouteOptions) {
  const seneca: ISeneca = this;

  const settings = seneca.util.deepextend<IRouteOptions, IRouteOptions>(defaultOptions, options);

  function middleware(req: Request, res: Response, next: NextFunction) {
    Object.assign(req, { seneca });

    next();
  }

  function route(routeOptions: IRouteOptions = {}) {
    const fullRouteOptions = <IRouteOptions> seneca.util.deepextend(settings, routeOptions);

    let args: IMessage = {};

    return function routeMiddleware(req: Request, res: Response, next: NextFunction) {
      if (Array.isArray(fullRouteOptions.query)) {
        args = Object.assign(args, pick(req.query, fullRouteOptions.query));
      } else if (fullRouteOptions.query) {
        args = Object.assign(args, req.query);
      }

      if (Array.isArray(fullRouteOptions.body)) {
        args = Object.assign(args, pick(req.body, fullRouteOptions.body));
      } else if (fullRouteOptions.body) {
        args = Object.assign(args, req.body);
      }

      if (Array.isArray(fullRouteOptions.params)) {
        args = Object.assign(args, pick(req.params, fullRouteOptions.params));
      } else if (fullRouteOptions.params) {
        args = Object.assign(args, req.params);
      }

      if (fullRouteOptions.pin) {
        if (typeof fullRouteOptions.pin === "string") {
          fullRouteOptions.pin = jsonic(fullRouteOptions.pin);
        }

        args = Object.assign(args, fullRouteOptions.pin);
      }

      args.req$ = req;
      args.res$ = res;

      function callback(err, msg: IMessage) {
        if (typeof fullRouteOptions.response === "function") {
          fullRouteOptions.response(req, res, err, msg);
        } else {
          if (err) {
            next(err);
          } else {
            next();
          }
        }
      }

      if (typeof fullRouteOptions.handler === "function") {
        fullRouteOptions.handler(req, res, args, seneca.act, callback);
      } else {
        seneca.act(args, callback);
      }
    };
  }

  return {
    name: 'pliny',
    export: middleware,
    exportmap: {
      route,
    },
  };
}
