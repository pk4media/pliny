/// <reference path="typings/globals/express/index.d.ts"/>
/// <reference path="typings/globals/seneca-node/index.d.ts"/>

/**
 * Express middleware Seneca library
 *
 * Allows for triggering Seneca actions based on express request properties
 */

import express = require("express");
import seneca = require("seneca");

declare namespace pliny {
  interface IMessage {
    req$?: express.Request;
    res$?: express.Response;
  }

  interface IRouteOptions {
      pin?: string | {
          [key: string]: any;
      };
      query?: string[] | boolean;
      body?: string[] | boolean;
      params?: string[] | boolean;
      response?: (req: express.Request, res: express.Response, err: any, message: IMessage) => void;
      handler?: <T>(req: express.Request, res: express.Response, message: IMessage, action: any, respond: (err: any, message: T) => void) => void;
  }

  export interface IRouteExport {
    (options: IRouteOptions): void;
  }
}

declare module "pliny" {
  var pliny: seneca.IPlugin<pliny.IRouteOptions>;
  export = pliny;
}
