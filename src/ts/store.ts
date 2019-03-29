import { State as ThingState, ThingModel } from './thing/thing.model';

export interface Models {
  thing: ThingModel;
}

export interface RootState {
  thing: ThingState;
}
