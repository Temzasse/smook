import { useModel as _useModel, effect as _effect, EffectFn } from 'smook';
import { Models, RootState } from './store';

// TODO: is there a better way to do this?
function typify<M, S>() {
  return {
    useModel: function<N extends keyof M>(modelName: N) {
      return _useModel<M, N>(modelName);
    },
    effect: function<A = void>(fn: EffectFn<M, S, A>) {
      return _effect<M, S, A>(fn);
    },
  };
}

export const { useModel, effect } = typify<Models, RootState>();
