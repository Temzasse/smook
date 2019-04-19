declare module 'smook' {
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

  type EffectFn<M, S, A> = (
    models: M,
    getState: () => S,
    args: A
  ) => Promise<any> | void;

  interface Effect<F> {
    is: string;
    fn: F;
  }

  enum FetchableStatus {
    INITIAL = 'INITIAL',
    LOADING = 'LOADING',
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE',
  }

  interface FetchableInitialState {
    status: FetchableStatus.INITIAL;
    error: null;
  }

  interface FetchableLoadingState {
    status: FetchableStatus.LOADING;
  }

  interface FetchableFailureState<T> {
    status: FetchableStatus.FAILURE;
    error: T;
  }

  interface FetchableSuccessState<T> {
    status: FetchableStatus.SUCCESS;
    error: null;
    data: T;
  }

  interface FetchableValue<T> {
    data: T;
    error: any;
    status: FetchableStatus;
  }

  // TODO
  type FetchableReducer = any;

  interface Fetchable {
    loading: () => FetchableLoadingState;
    error: <T>(error: T = any) => FetchableFailureState<T>;
    success: <T>(data: T = any) => FetchableSuccessState<T>;
    clear: () => FetchableInitialState;
    reducer: FetchableReducer;
    value: <T>(initialValue: T) => FetchableValue<T>;
  }

  interface Action<P> {
    type: string;
    payload: P;
  }

  interface Model<M extends ModelDefinition, S extends object> {
    actions: {
      [K in keyof M['actions']]: (
        payload: M['actions'][K] extends Effect<EffectFn<any, any, any>>
          ? Unpacked<ArgumentTypes<M['actions'][K]['fn']>[2]>
          : ArgumentTypes<M['actions'][K]>[1] extends Action<any>
          ? ArgumentTypes<M['actions'][K]>[1]['payload']
          : void
      ) => any
    };
    selectors: { [K in keyof M['selectors']]: M['selectors'][K] };
    select: <F extends keyof S | SelectorFn>(
      fieldOrSelectorFn: F
    ) => F extends keyof S
      ? S[F]
      : F extends SelectorFn
      ? ReturnType<F>
      : never;
  }

  export function useModel<M, N extends keyof M>(modelName: N): M[N];

  export function effect<M, S, A = void>(
    fn: EffectFn<M, S, A>
  ): Effect<EffectFn<M, S, A>>;

  export function createStore(models: ModelDefinition[]): any;

  export const StoreProvider = (props: any) => any;

  export const fetchable: Fetchable;
}
