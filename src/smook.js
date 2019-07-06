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
const EFFECT = 'EFFECT';

export const StoreProvider = ({ store, disableLogs, children }) => {
  const { rootReducer, initialState, models, setActions } = store;
  const [state, _dispatch] = React.useReducer(rootReducer, initialState);
  const currentState = React.useRef(state);
  const subscriptions = React.useRef({});

  // TODO: is there a better way to log prev + next state?
  // At the moment the next state is not logged in the same group...
  React.useEffect(() => {
    const changedModels = getChangedModels(currentState.current, state);

    if (changedModels.length > 0 && !disableLogs) {
      log.state(state, changedModels);
    }

    changedModels.forEach(m => {
      const affectedHandlers = subscriptions.current[m];
      affectedHandlers.forEach(handler => handler());
    });

    currentState.current = state; // Update ref to point in the current state
  }, [disableLogs, state]);

  const dispatch = React.useCallback(
    action => {
      if (!disableLogs) log.action(action, currentState.current);
      _dispatch(action);
    },
    [disableLogs]
  );

  const { actions, subscribe } = React.useMemo(() => {
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

    const getState = () => currentState.current;

    const aggregated = Object.values(models).reduce((modelsAcc, model) => {
      const modelActions = Object.entries(model.actions).reduce(
        (actionsAcc, [actionName, value]) => {
          if (value.is === EFFECT) {
            actionsAcc[actionName] = (...args) => {
              dispatch({
                type: `${model.name}/${actionName}`,
                payload: args,
              });

              return value.fn(modelsAcc, getState, ...args);
            };
          } else {
            actionsAcc[actionName] = payload =>
              dispatch({
                type: `${model.name}/${actionName}`,
                payload,
              });
          }

          return actionsAcc;
        },
        {}
      );

      modelsAcc[model.name] = {
        actions: modelActions,
        selectors: model.selectors,
      };

      return modelsAcc;
    }, {});

    const actions = Object.entries(aggregated).reduce((acc, [key, val]) => {
      acc[key] = val.actions;
      return acc;
    }, {});

    // Make it possible to access actions directly from the store instance
    setActions(actions);

    return { actions, subscribe };
  }, [dispatch]); // eslint-disable-line

  return (
    <Context.Provider value={{ state, actions, models, subscribe }}>
      {children}
    </Context.Provider>
  );
};

export const useModel = name => {
  const { state, actions, models, subscribe } = React.useContext(Context);
  const forceUpdate = useForceUpdate();

  // NOTE: deps array can be empty since none of the used deps will not change
  React.useEffect(() => {
    const unsubscribe = subscribe(name, () => forceUpdate());
    return () => unsubscribe();
  }, []); // eslint-disable-line

  const select = fieldNameOrSelectorFn => {
    if (typeof fieldNameOrSelectorFn === 'string') {
      return state[name][fieldNameOrSelectorFn];
    } else {
      return fieldNameOrSelectorFn(state);
    }
  };

  return {
    select,
    actions: actions[name],
    selectors: models[name].selectors,
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
      .filter(([, fn]) => fn.is !== EFFECT)
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

  let _actions = null;

  const setActions = actions => {
    _actions = actions;
  };

  const getActions = () => {
    if (!_actions) {
      throw Error(
        'You need to render the Provider before accessing any actions from the instance store!'
      );
    }

    return _actions;
  };

  return {
    rootReducer,
    initialState,
    setActions,
    getActions,
    models: _models,
  };
};

export const effect = fn => ({ is: EFFECT, fn });

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
