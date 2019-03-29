import { Action, effect } from './smook';
import { sleep } from '../helpers';
import { State, Models } from './store';
import { Thing, ThingState } from './thing.types';

const thingModel = {
  name: 'thing',
  state: {
    items: [],
    foo: 1,
  },
  selectors: {
    getNumOfItems: (state: State) => state.thing.items.length,
  },
  actions: {
    saveThing: effect<Models, State, Thing>(async function(
      models,
      getState,
      thing
    ) {
      console.log(thing.bar);
      await sleep(1000);
    }),
    fetchItems: effect<Models, State>(async function(models, getState) {
      await sleep(1000);
      const state = getState();
      console.log(state);
      models.thing.actions.addItem(1);
    }),
    addItem: (state: ThingState, action: Action<number>) => ({
      ...state,
      items: [...state.items, action.payload],
    }),
    clearItems: (state: ThingState) => ({
      ...state,
      items: [],
    }),
  },
};

export default thingModel;
