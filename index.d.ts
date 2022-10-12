/// <reference types="jquery"/>

export interface IRequest {
  type: string;
  mbean: string;
  operation?: string;
  attribute?: string | string[];
  arguments?: unknown[];
  path?: string;

  // TODO - In case I forgot something
  [name: string]: unknown;
}

export interface IResponse {
  status: number;
  timestamp: number;
  request: IRequest;
  value: unknown;
  history?: IResponse[];
}

export interface IErrorResponse extends IResponse {
  error_type: string;
  error: string;
  stacktrace: string;
}

export interface IParams {
  type?: string;
  jsonp?: boolean;
  dataType?: string;
  contentType?: string;
  username?: string;
  password?: string;
  timeout?: number;
  url?: string;
  method?: string;
  error?(response: IErrorResponse): void;
  ajaxError?: (xhr: JQueryXHR, text: string, error: string) => void;
  maxDepth?: number;
  canonicalProperties?: boolean;
  maxCollectionSize?: number;
  maxObjects?: number;
  ignoreErrors?: boolean;
  serializeException?: boolean;
  includeStackTrace?: boolean;
  ifModifiedSince?: Date;

  // TODO - In case I forgot something
  [name: string]: unknown;
}

export interface IParamsSingle extends IParams {
  success?(response: IResponse): void;
}

export interface IParamsBulk extends IParams {
  success?: ((response: IResponse) => void)[];
}

export interface IRegisterParams {
  success?(response: IResponse): void;
  error?(response: IErrorResponse): void;
  config?: IParams;
}

export interface IRegisterRequest extends IRequest {
  config?: IParams;
}

export interface IAgentConfig {
  agentDescription: string;
  agentId: string;
  agentType: string;
  serializeException: string;
  [name: string]: unknown;
}

export interface IExtraInfo {
  [name: string]: unknown;
}

export interface IAgentInfo {
  product: string;
  vendor: string;
  version: string;
  extraInfo: IExtraInfo;
}

export interface IVersion {
  protocol: string;
  agent: string;
  config: IAgentConfig;
  info: IAgentInfo;
}

// we'll assume jolokia-simple.js is also being included
export interface IJolokia {
  // low-level request API
  request(...args: unknown[]): unknown;

  // simple API
  /**
   * Get one or more attributes
   *
   * @param {string} mbean objectname of MBean to query. Can be a pattern.
   * @param {string} attribute attribute name. If an array, multiple attributes are fetched.
   *                           If <code>null</code>, all attributes are fetched.
   * @param {string|IParams} path optional path within the return value. For multi-attribute fetch, the path
   *                              is ignored.
   * @param {IParams} opts options passed to Jolokia.request()
   * @return {unknown} the value of the attribute, possibly a complex object
   */
  getAttribute(mbean: string, attribute: string, path?: string | IParams, opts?: IParams): unknown;
  /**
   * Set an attribute on a MBean.
   *
   * @param {string} mbean objectname of MBean to set
   * @param {string} attribute the attribute to set
   * @param {unknown} value the value to set
   * @param {string|IParams} path an optional <em>inner path</em> which, when given, is used to determine
   *                              an inner object to set the value on
   * @param {IParams} opts additional options passed to Jolokia.request()
   * @return {unknown} the previous value
   */
  setAttribute(mbean: string, attribute: string, value: unknown, path?: string | IParams, opts?: IParams): unknown;

  /**
   * executes an JMX operation, very last parameter can be an IParams
   *
   * @param mbean
   * @param operation
   * @param arguments
   */
  execute(mbean: string, operation: string, ...arguments: unknown[]): unknown;
  search(mBeanPattern: string, opts?: IParams): unknown;
  list(path: string | null, opts?: IParams): unknown;
  version(opts?: IParams): IVersion;

  // scheduler
  register(callback: (...response: IResponse[]) => void, ...request: IRequest[]): number;
  register(params: IRegisterParams, ...request: IRegisterRequest[]): number;
  unregister(handle: number): void;
  jobs(): number[];
  start(period: number): void;
  stop(): void;
  isRunning(): boolean;
}

export const Jolokia: {
  new(opts?: IParams): IJolokia;
  new(url?: string): IJolokia;
  (): IJolokia;
};
export const cubism: unknown;
export const d3: unknown;

export default Jolokia;
