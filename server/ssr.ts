import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';
import type { RequestHandler } from 'express';
import bootstrap from '../src/main.server';
import { allowedHosts, browserDistFolder, indexHtml } from './config';

const commonEngine = new CommonEngine({ allowedHosts });

export const ssrHandler: RequestHandler = (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;

  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
      providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
    })
    .then((html) => res.send(html))
    .catch((err) => next(err));
};
