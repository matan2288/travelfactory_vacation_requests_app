import { loadEnv } from 'commoneventframework';

const envReady = loadEnv();

import './generated/HandlerRegistry';

import path from 'path';
import {
  buildCommonEvent,
  getRouteConfig,
  resolveHandlerRef,
  Response,
  setLambdaContext,
  startDevServer,
  type APIGatewayProxyStructuredResultV2,
  type Context,
} from 'commoneventframework';
import type { LambdaEvent } from 'commoneventframework/dist/types/commonEvent';
import { env } from './config/env';
import { initDataSource } from './database/data-source';
import { AppError } from './shared/errors';
import { eventDispatcher } from './shared/events';
import { HttpResult } from './shared/http';

// Resolved next to this file so the dev server (src/), tests and the bundle (dist/) all find it.
const ROOT_YAML = path.join(__dirname, 'root.yaml');
let routesLoaded = false;

eventDispatcher.subscribe('*', (event) => console.info(`[event] ${event.name}`, JSON.stringify(event)));

function json(statusCode: number, body: unknown): APIGatewayProxyStructuredResultV2 {
  // CEF's defaults omit PATCH and read FRONT_END_URL before .env loads, so both are set here.
  return new Response(statusCode, body as object, {
    'Access-Control-Allow-Origin': process.env.FRONT_END_URL || '*',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,PATCH,DELETE',
  });
}

function toErrorResponse(error: unknown): APIGatewayProxyStructuredResultV2 {
  if (error instanceof AppError) {
    return json(error.status, { code: error.code, message: error.message, ...(error.details && { details: error.details }) });
  }
  console.error('[unhandled]', error);
  return json(500, { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' });
}

/** Lambda entry point (also served locally by the CEF dev server). */
export const handler = async (event: LambdaEvent, context: Context): Promise<APIGatewayProxyStructuredResultV2> => {
  await envReady;
  await setLambdaContext(context);
  try {
    const commonEvent = buildCommonEvent(event, routesLoaded ? undefined : ROOT_YAML);
    routesLoaded = true;
    if (commonEvent.method === 'OPTIONS') return json(204, {});

    const route = getRouteConfig(commonEvent);
    const handlerRef = route?.handler;
    const handlerFn = handlerRef ? resolveHandlerRef(handlerRef) : undefined;
    if (!route || !handlerRef || !handlerFn) return json(404, { code: 'NOT_FOUND', message: 'Route not found.' });

    // Built-in CEF routes (/doc, /doc/spec, ...) have no `file#export` ref and return ready responses.
    if (!handlerRef.includes('#')) return await handlerFn({}, commonEvent);

    await initDataSource();
    const parserFn = route.inputParser ? resolveHandlerRef(route.inputParser) : undefined;
    const input = parserFn ? await parserFn(commonEvent) : {};
    if (input instanceof Response) return input;

    const result = await handlerFn(input, commonEvent);
    return result instanceof HttpResult ? json(result.statusCode, result.body) : json(200, result);
  } catch (error) {
    return toErrorResponse(error);
  }
};

if (process.argv.includes('--local')) {
  envReady
    .then(() => {
      env(); // fail fast on missing configuration
      return initDataSource();
    })
    .then(() => startDevServer(handler))
    .catch((error) => {
      console.error('Startup failed:', error);
      process.exit(1);
    });
}
