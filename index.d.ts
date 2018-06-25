class Applet<T = Applet.Context> {
  context: T;
  env: string;
  silent: boolean;
  stack: Array<Applet.Middleware<T> | Applet.ComposedMiddleware<T>>;

  new(silent?: boolean, keys?: string | string[]);

  listeners?(event: string | symbol): Function[];

  on?(event: string | symbol, listener: (...args: any[]) => void): this;

  emit?(event: string | symbol, ...args: any[]): boolean;

  use(...fns: Applet.Middleware<T>[]): this;

  onerror(err: Error);

  callback(context: Record<string, any> | Applet.ContextGenerator): Applet.HandleFunction<T>;
}

declare namespace Applet {

  type NextFunction = () => Promise<any>;
  type Middleware<T> = (context: T, next: NextFunction) => any;
  type ComposedMiddleware<T> = (context: T, next?: NextFunction) => Promise<void>;
  type DoneFunction<T> = (context: T) => any;
  type HandleFunction<T> = (done: DoneFunction<T>) => Promise<any>;
  type ContextGenerator = (any) => Record<string, any> | Applet.Context | any;

  interface Context {
    silent?: boolean;
    env?: string;

    [key: string]: any;
  }

  function compose<T>(middleware: Array<Middleware<T> | ComposedMiddleware<T>>): ComposedMiddleware<T>;

  function only(obj: Record<string, any>, keys: string | string[]): Record<string, any>;

  const App = Applet;
}

export as namespace Applet;
export = Applet;
