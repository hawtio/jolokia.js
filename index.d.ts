/// <reference types="jquery"/>

/**
 * The top level object returned from a 'list' operation.
 */
export type IJmxDomains = {
  [domainName: string]: IJmxDomain;
};

/**
 * Individual JMX domain, MBean names are stored as keys.
 */
export type IJmxDomain = {
  [mbeanName: string]: IJmxMBean;
};

/**
 * JMX MBean object that contains the operations/attributes.
 */
export interface IJmxMBean {
  op: IJmxOperations;
  attr: IJmxAttributes;
  desc: string;
  canInvoke?: boolean;
}

/**
 * JMX MBean attributes, attribute name is the key.
 */
export type IJmxAttributes = {
  [attributeName: string]: IJmxAttribute;
};

/**
 * JMX attribute object that contains the type, description and if it's read/write
 * or not.
 */
export interface IJmxAttribute {
  desc: string;
  rw: boolean;
  type: string;
  canInvoke?: boolean;
}

/**
 * JMX operation object that's a map of the operation name to the operation schema.
 */
export type IJmxOperations = {
  [methodName: string]: IJmxOperation;
};

/**
 * Schema for a JMX operation object.
 */
export interface IJmxOperation {
  args: IJmxOperationArgument[];
  desc: string;
  ret: string;
  canInvoke?: boolean;
}

/**
 * Operation arguments are stored in a map of argument name -> type.
 */
export interface IJmxOperationArgument {
  name: string;
  desc: string;
  type: string;
}

/**
 * Request operation.
 * https://jolokia.org/reference/html/protocol.html#jolokia-operations
 */
export type IRequest =
  | { type: 'read'; mbean: string; attribute?: string | string[]; path?: string; }
  | { type: 'write'; mbean: string; attribute: string; value: unknown; path?: string; }
  | { type: 'exec'; mbean: string; operation: string; arguments?: unknown[]; }
  | { type: 'search'; mbean: string; }
  | { type: 'list'; path?: string; }
  | { type: 'version'; };

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

export type IResponseFn = (response: IResponse) => void;

export type IErrorResponseFn = (response: IErrorResponse) => void;

export type IAjaxErrorFn = (xhr: JQueryXHR, text: string, error: string) => void;

/**
 * Processing parameters.
 * https://jolokia.org/reference/html/protocol.html#processing-parameters
 */
export interface IParams {
  maxDepth?: number;
  maxCollectionSize?: number;
  maxObjects?: number;
  ignoreErrors?: boolean;
  mimeType?: string;
  canonicalNaming?: boolean;
  includeStackTrace?: boolean;
  serializeException?: boolean;
  ifModifiedSince?: Date;
}

/**
 * Common request options shared by the low-level request and simple APIs.
 * https://jolokia.org/reference/html/clients.html#js-request-options-table
 */
export interface IOptionsBase extends IParams {
  url?: string;
  method?: string;
  jsonp?: boolean;

  // success differs between the request and simple APIs
  error?: IErrorResponseFn;
  ajaxError?: IAjaxErrorFn;

  username?: string;
  password?: string;
  timeout?: number;
  canonicalProperties?: boolean;

  // TODO: needed?
  /*
  type?: string;
  dataType?: string;
  contentType?: string;
  */

  // Other implicit options
  [name: string]: unknown;
}

/**
 * Request options of a single request used for the low-level request API.
 */
export interface IOptions extends IOptionsBase {
  success?: IResponseFn;
}

/**
 * Request options of bulk requests used for the low-level request API.
 */
export interface IBulkOptions extends IOptionsBase {
  success?: IResponseFn[];
}

/**
 * Request options used for the simple API.
 */
export interface ISimpleOptions extends IOptionsBase {
  success?: (value: unknown) => void;
}

/**
 * Request options used for the SEARCH simple API.
 */
export interface ISearchOptions extends IOptionsBase {
  success?: (value: string[]) => void;
}

/**
 * Request options used for the LIST simple API.
 */
export interface IListOptions extends IOptionsBase {
  success?: (value: IJmxDomains) => void;
}

/**
 * Request options used for the VERSION simple API.
 */
export interface IVersionOptions extends IOptionsBase {
  success?: (value: IVersion) => void;
}

export interface IRegisterParams {
  success?: IResponseFn;
  error?: IErrorResponseFn;
  config?: IOptions;
}

export interface IRegisterRequest extends IRequest {
  config?: IOptions;
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
  // ===========================================================================
  // Low-level request API:
  // https://jolokia.org/reference/html/clients.html#js-request
  // ===========================================================================
  request(operation: IRequest, opts: IOptions): unknown | null;
  request(operations: IRequest[], opts: IBulkOptions): unknown[] | null;

  // ===========================================================================
  // Simple API:
  // https://jolokia.org/reference/html/clients.html#js-simple
  // ===========================================================================
  /**
   * This method returns the value of an JMX attribute of an MBean.
   * A path can be optionally given, and the optional request options are given
   * as last argument(s). The return value for synchronous operations are the attribute's
   * value, for asynchronous operations (i.e. `opts.success != null`) it is `null`.
   *
   * @param {string} mbean objectname of MBean to query. Can be a pattern.
   * @param {string} attribute attribute name. If an array, multiple attributes are fetched.
   *                           If <code>null</code>, all attributes are fetched.
   * @param {string} path optional path within the return value. For multi-attribute fetch,
   *                      the path is ignored.
   * @param {IOptions} opts options passed to Jolokia.request()
   * @return {unknown|null} the value of the attribute, possibly a complex object
   */
  getAttribute(mbean: string, attribute: string, path: string, opts?: ISimpleOptions): unknown | null;
  getAttribute(mbean: string, attribute: string, opts?: ISimpleOptions): unknown | null;
  /**
   * For setting an JMX attribute, this method takes the MBean's name, the attribute
   * and the value to set. The optional path is the inner path of the attribute
   * on which to set the value. The old value of the attribute is returned or given
   * to a `success` callback.
   *
   * @param {string} mbean objectname of MBean to set
   * @param {string} attribute the attribute to set
   * @param {unknown} value the value to set
   * @param {string} path an optional <em>inner path</em> which, when given, is
   *                      used to determine an inner object to set the value on
   * @param {IOptions} opts additional options passed to Jolokia.request()
   * @return {unknown|null} the previous value
   */
  setAttribute(mbean: string, attribute: string, value: unknown, path: string, opts?: ISimpleOptions): unknown | null;
  setAttribute(mbean: string, attribute: string, value: unknown, opts?: ISimpleOptions): unknown | null;
  /**
   * With this method, a JMX operation can be executed on the MBean. Beside the
   * operation's name, one or more arguments can be given depending on the signature
   * of the JMX operation. The return value is the return value of the operation.
   *
   * @param mbean the MBean name
   * @param operation the operation name to execute
   * @param arguments the arguments to pass to the operation
   */
  execute(mbean: string, operation: string, ...arguments: unknown[]): unknown | null;
  /**
   * Searches for one or more MBeans whose object names fit the pattern.
   * The return value is a list of strings with the matching MBean names or `null`
   * if none is found.
   *
   * @param mBeanPattern the MBean pattern
   * @param opts optional request options
   */
  search(mBeanPattern: string, opts?: ISearchOptions): string[] | null;
  /**
   * For getting meta information about registered MBeans, the list command can
   * be used. The optional path points into this meta information for retrieving
   * partial information.
   *
   * @param path the path to list the information
   * @param opts optional request options
   */
  list(path: string | null, opts?: IListOptions): IJmxDomains | null;
  /**
   * The version method returns the agent's version, the protocol version, and
   * possibly some additional server-specific information.
   *
   * @param opts optional request options
   */
  version(opts?: IVersionOptions): IVersion | null;

  // ===========================================================================
  // Request scheduler:
  // https://jolokia.org/reference/html/clients.html#js-poller
  // ===========================================================================
  register(callback: (...response: IResponse[]) => void, ...request: IRequest[]): number;
  register(params: IRegisterParams, ...request: IRegisterRequest[]): number;
  unregister(handle: number): void;
  jobs(): number[];
  start(period: number): void;
  stop(): void;
  isRunning(): boolean;
}

export const Jolokia: {
  new(opts?: IOptions): IJolokia;
  new(url?: string): IJolokia;
  (): IJolokia;
};
export const cubism: unknown;
export const d3: unknown;

export default Jolokia;
