import React from 'react';
import { log, useForceUpdate, getChangedModels } from './helpers';

// Smook -> State Management hOOK 🔱

// Take ideas from:
// - https://github.com/reduxjs/react-redux/issues/1179
// - https://github.com/reduxjs/react-redux/issues/1179#issuecomment-476133300

// Maybe use Proxies to improve perf?
// - https://github.com/dai-shi/reactive-react-redux
// - https://github.com/thekashey/proxyequal (no IE11 support!)

// Disable normal context update behaviour since we want to update
// the components manually via subscriptions
const calcChangedBits = () => 0;
const Context = React.createContext({}, calcChangedBits);

export const StoreProvider = ({ store, disableLogs, children }) => {
  const { rootReducer, initialState, models } = store;
  const [state, dispatch] = React.useReducer(rootReducer, initialState);
  const currentState = React.useRef(state);
  const subscriptions = React.useRef({});

  // TODO: is there a better way to log prev + next state?
  // At the moment the next state is not logged in the same group...
  React.useEffect(() => {
    if (!disableLogs) log.state(state);

    const changedModels = getChangedModels(currentState.current, state);

    if (changedModels.length > 0) {
      console.log(
        `> Updating components that depend on models: ${changedModels.join(
          ','
        )}.`
      );
    }

    changedModels.forEach(m => {
      const affectedHandlers = subscriptions.current[m];
      affectedHandlers.forEach(handler => handler());
    });

    currentState.current = state; // Update ref to point in the current state
  }, [state]);

  const loggedDispatch = action => {
    if (!disableLogs) log.action(action, state);
    dispatch(action);
  };

  const getState = () => currentState.current;

  const subscribe = (modelName, handlerFn) => {
    if (!subscriptions.current[modelName]) {
      subscriptions.current[modelName] = [];
    }

    subscriptions.current[modelName].push(handlerFn);

    const unsubscribe = () => {
      const remaining = subscriptions.current[modelName].filter(
        x => x !== handlerFn
      );
      subscriptions.current[modelName] = remaining;
    };

    return unsubscribe;
  };

  // Memoize actions since they need to be created only once
  const enhancedActions = React.useMemo(
    () =>
      Object.values(models).reduce((allActionsAcc, model) => {
        const actions = Object.entries(model.actions).reduce(
          (modelActionsAcc, [actionName, value]) => {
            if (value.is === 'EFFECT') {
              modelActionsAcc[actionName] = (...args) => {
                loggedDispatch({
                  type: `${model.name}/${actionName}`,
                  payload: args,
                });

                return value.fn(allActionsAcc, getState, ...args);
              };
            } else {
              modelActionsAcc[actionName] = payload =>
                loggedDispatch({
                  type: `${model.name}/${actionName}`,
                  payload,
                });
            }

            return modelActionsAcc;
          },
          {}
        );

        allActionsAcc[model.name] = {
          actions,
          selectors: model.selectors,
        };

        return allActionsAcc;
      }, {}),
    [] // Having no deps here should be ok?
  );

  return (
    <Context.Provider
      value={{
        models,
        state,
        getState,
        subscribe,
        dispatch: loggedDispatch,
        actions: enhancedActions,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useModel = name => {
  const store = React.useContext(Context);
  const forceUpdate = useForceUpdate();

  React.useEffect(() => {
    const unsubscribe = store.subscribe(name, () => forceUpdate());
    return () => unsubscribe();
  }, [store]);

  const select = fieldNameOrSelectorFn => {
    if (typeof fieldNameOrSelectorFn === 'string') {
      return store.state[name][fieldNameOrSelectorFn];
    } else {
      return fieldNameOrSelectorFn(store.state);
    }
  };

  return {
    select,
    actions: store.actions[name].actions,
    selectors: store.models[name].selectors,
  };
};

export const createStore = models => {
  const initialState = models.reduce((acc, model) => {
    acc[model.name] = { ...model.state };
    return acc;
  }, {});

  const rootReducer = (state, action) => {
    const nextState = models.reduce((acc, model) => {
      acc[model.name] = model.reducer(state[model.name], action);
      return acc;
    }, {});
    return nextState || state;
  };

  const _models = models.reduce((acc, model) => {
    const reducerHandler = Object.entries(model.actions)
      .filter(([, fn]) => fn.is !== 'EFFECT')
      .reduce((acc, [name, fn]) => {
        acc[`${model.name}/${name}`] = fn;
        return acc;
      }, {});

    model.reducer = (state, action) =>
      reducerHandler[action.type]
        ? reducerHandler[action.type](state, action)
        : state;

    acc[model.name] = model;
    return acc;
  }, {});

  return {
    rootReducer,
    initialState,
    models: _models,
  };
};

export const effect = fn => ({ is: 'EFFECT', fn });

const fetchableReducer = field => (state, action) => ({
  ...state,
  [field]: { ...state[field], ...action.payload },
});

export const fetchable = {
  loading: () => ({ status: 'LOADING' }),
  failure: (error = '') => ({ error, status: 'FAILURE' }),
  success: (data = null) => ({ data, status: 'SUCCESS', error: null }),
  clear: () => ({ status: 'INITIAL', error: null }),
  value: initial => ({ data: initial, error: null, status: 'INITIAL' }),
  reducer: fetchableReducer,
};
