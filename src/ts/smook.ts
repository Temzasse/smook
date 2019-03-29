import { useModel as _useModel, effect as _effect } from '../smook';

/* ******************************** HELPERS ******************************** */
type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends (...args: any[]) => infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T;

type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any
  ? A
  : never;

/* ******************************* INTERNAL ******************************** */
interface ModelDefinition {
  name: string;
  state: {
    [field: string]: any;
  };
  actions: {
    [action: string]: any;
  };
  selectors: {
    [selector: string]: any;
  };
}

type SelectorFn = (...args: any[]) => any;

type AsyncAction<M, S, A> = (
  models: M,
  getState: () => S,
  args: A
) => Promise<any>;

interface Effect<F> {
  is: string;
  fn: F;
}

/* ******************************** EXPORTS ******************************** */
export interface Action<P> {
  type: string;
  payload: P;
}

export interface Model<M extends ModelDefinition, S extends object> {
  actions: {
    [K in keyof M['actions']]: (
      payload: M['actions'][K] extends Effect<AsyncAction<any, any, any>>
        ? Unpacked<ArgumentTypes<M['actions'][K]['fn']>[2]>
        : ArgumentTypes<M['actions'][K]>[1] extends Action<any>
        ? ArgumentTypes<M['actions'][K]>[1]['payload']
        : void
    ) => any
  };
  selectors: { [K in keyof M['selectors']]: M['selectors'][K] };
  select: <F extends keyof S | SelectorFn>(
    fieldOrSelectorFn: F
  ) => F extends keyof S ? S[F] : F extends SelectorFn ? ReturnType<F> : never;
}

export function useModel<M, N extends keyof M>(modelName: N): M[N] {
  return (_useModel(modelName) as unknown) as M[N];
}

export function effect<M, S, A = void>(fn: AsyncAction<M, S, A>) {
  return _effect(fn) as Effect<AsyncAction<M, S, A>>;
}
