import { createStore } from './smook';
import { State as ThingState, ThingModel } from './thing/thing.model';
import thingModel from './thing/thing.model';

export interface Models {
  thing: ThingModel;
}

export interface RootState {
  thing: ThingState;
}

const store = createStore([thingModel]);

export default store;
