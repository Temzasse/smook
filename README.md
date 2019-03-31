<div align="center">

<h1>Smook 🔱</h1>

<p>State management in the era of React Hooks.</p>

</div>

---

- 🦆 **Enforce modular architecture.**
- 🔮 **Mininal boilerplate.**
- ✨ **Async data fetching made easy.**

---

- [Installation](#installation)
- [TypeScript](#typescript)
- [Caveats](#caveats)

## Installation

> **NOTE:** not a real npm package yet!

```sh
npm install smook
```

> **TODO:** write instructions...

## TypeScript

First create a model:

```ts
// thing.model.ts

import { Model, Action, effect } from 'smook';
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
    fetchThings: effect<Models, RootState>(async function(models, getState) {
      const state = getState();
      console.log('> Current things:', state.thing.things);

      // Fetch things from API etc.
      const thing = {
        id: '1', name:
        'Foobar', size: 1
      };

      models.thing.actions.addThing(thing);
    }),

    addThing: (state: State, action: Action<Thing>): State => ({
      ...state,
      things: [...state.things, action.payload],
    }),
  },
};

export type ThingModel = Model<typeof thingModel, State>;

export default thingModel;
```

```ts
// store.ts

import { createStore } from 'smook';
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
```

```tsx
// Thing.tsx

import React from 'react';
import { useModel } from 'smook';
import { Models } from '../store';

const Thing = () => {
  const thingM = useModel<Models, 'thing'>('thing');
  const things = thingM.select('things');
  const hasError = thingM.select('hasError');
  const isLoading = thingM.select('isLoading');
  const numOfThings = thingM.select(thingM.selectors.getNumOfThings);
  const { addThing, clearThings, fetchThings } = thingM.actions;

  React.useEffect(() => {
    fetchThings();
  }, []);

  // TODO: use values / actions in render...

  return <div>Thing</div>;
};

export default Thing;
```
