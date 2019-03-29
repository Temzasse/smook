import { sleep } from '../../helpers';
import { Model, Action, effect } from '../smook';
import { RootState, Models } from '../store';
import { Thing } from './thing.types';

export interface State {
  things: Thing[];
  isLoading: boolean;
  hasError: boolean;
}

const thingModel = {
  name: 'thing',

  state: {
    things: [],
    isLoading: false,
    hasError: false,
  },

  selectors: {
    getNumOfThings: (state: RootState) => state.thing.things.length,
  },

  actions: {
    logThing: effect<Models, RootState, Thing>(async function(
      models,
      getState,
      thing
    ) {
      await sleep(1000);
      console.log('> Thing:', thing.name);
      const state = getState();
      console.log('> Things now:', state.thing.things);
    }),

    fetchThings: effect<Models, RootState>(async function(models, getState) {
      await sleep(1000);
      const state = getState();
      console.log('> Current things:', state.thing.things);
      const thing = { id: '1', name: 'Foobar', size: 1 };
      models.thing.actions.addThing(thing);
      models.thing.actions.logThing(thing);
      await sleep(3000);
      models.thing.actions.clearThings();
    }),

    addThing: (state: State, action: Action<Thing>): State => ({
      ...state,
      things: [...state.things, action.payload],
    }),

    clearThings: (state: State): State => ({
      ...state,
      things: [],
    }),
  },
};

export type ThingModel = Model<typeof thingModel, State>;

export default thingModel;
