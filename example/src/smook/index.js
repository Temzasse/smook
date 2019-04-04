import React from 'react';

// Smook -> State Management hOOK 🔱

// Take ideas from:
// - https://github.com/reduxjs/react-redux/issues/1179
// - https://github.com/reduxjs/react-redux/issues/1179#issuecomment-476133300

// Maybe use Proxies to improve perf?
// - https://github.com/dai-shi/reactive-react-redux
// - https://github.com/thekashey/proxyequal (no IE11 support!)

const Context = React.createContext({});

const log = {
  state: state => {
    console.log(
      '%c next state ',
      'background: #b3ffaf; color: #12510f;',
      state
    );
  },
  action: (action, state) => {
    console.group(`${action.type}`);
    console.log(
      '%c prev state ',
      'background: #99dbff; color: #134966;',
      state
    );
    console.log('%c action ', 'background: #ffbcff; color: #440a44;', action);
    console.groupEnd();
  },
};

export const StoreProvider = ({ store, disableLogs, children }) => {
  const { rootReducer, initialState, models } = store;
  const [state, dispatch] = React.useReducer(rootReducer, initialState);
  const currentState = React.useRef(state);

  // TODO: is there a better way to log prev + next state?
  // At the moment the next state is not logged in the same group...
  React.useEffect(() => {
    if (!disableLogs) log.state(state);
    currentState.current = state; // Update ref to point in the current state
  }, [state]);

  const loggedDispatch = action => {
    if (!disableLogs) log.action(action, state);
    dispatch(action);
  };

  const getState = () => currentState.current;

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
        dispatch: loggedDispatch,
        actions: enhancedActions,
      }}
    >
      {children}
    </Context.Provider>
  );
};

// TODO: can we bail out of unnecessary renders?
export const useModel = name => {
  const store = React.useContext(Context);

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
      .filter(([name, fn]) => fn.is !== 'EFFECT')
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

export const effect = fn => ({
  is: 'EFFECT',
  fn,
});

const fetchableReducer = field => (state, action) => ({
  ...state,
  [field]: { ...state[field], ...action.payload },
});

export const fetchable = {
  loading: () => ({ status: 'LOADING' }),
  error: error => ({ error, status: 'FAILURE' }),
  success: data => ({ data, status: 'SUCCESS', error: null }),
  clear: () => ({ status: 'INITIAL', error: null }),
  reducer: fetchableReducer,
  value: initialValue => ({
    data: initialValue,
    error: null,
    status: 'INITIAL',
  }),
};
