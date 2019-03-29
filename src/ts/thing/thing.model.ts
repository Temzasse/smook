import { sleep } from '../../helpers';
import { Model, Action, effect } from '../smook';
import { RootState, Models } from '../store';
import { Thing, } from './thing.types';

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
    saveThing: effect<Models, State, Thing>(async function(
      models,
      getState,
      thing
    ) {
      console.log(thing.name);
      await sleep(1000);
    }),

    fetchThings: effect<Models, RootState>(async function(models, getState) {
      await sleep(1000);
      const state = getState();
      console.log(state.thing.hasError);
      models.thing.actions.addThing({
        id: '1',
        name: 'Foobar',
        size: 1,
      });
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
