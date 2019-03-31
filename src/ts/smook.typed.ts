import { typify } from './smook';
import { Models, RootState } from './store';

const typed = typify<Models, RootState>();
export const useModel = typed.useModel;
export const effect = typed.effect;
