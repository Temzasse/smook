import React from 'react';

// TODO: come up with a cooler name :p
// Smook -> State Management hOOK

const Context = React.createContext({});

export const StoreProvider = ({ store, children }) => {
  const { rootReducer, initialState, models } = store;
  const [state, dispatch] = React.useReducer(rootReducer, initialState);
  const currentState = React.useRef(state);

  // TODO: is there a better way to log prev + next state?
  React.useEffect(() => {
    console.log('%c state ', 'background: #b3ffaf; color: #12510f', state);
    currentState.current = state;
  }, [state]);

  const loggedDispatch = action => {
    console.group(`${action.type}`);
    console.log('%c prev ', 'background: #99dbff; color: #134966', state);
    console.log('%c action ', 'background: #ffbcff; color: #440a44', action);
    console.groupEnd();
    dispatch(action);
  };

  const getState = () => ({ ...currentState.current });

  return (
    <Context.Provider
      value={{ state, getState, dispatch: loggedDispatch, models }}
    >
      {children}
    </Context.Provider>
  );
};

// TODO: can we bail out of unnecessary renders?
export const useModel = name => {
  const store = React.useContext(Context);

  const allActions = React.useMemo(
    () =>
      Object.values(store.models).reduce((allActionsAcc, model) => {
        const actions = Object.entries(model.actions).reduce(
          (modelActionsAcc, [actionName, value]) => {
            if (value.is === 'EFFECT') {
              modelActionsAcc[actionName] = (...args) => {
                store.dispatch({
                  type: `${model.name}/${actionName}`,
                  payload: args,
                });

                return value.fn(allActionsAcc, store.getState, ...args);
              };
            } else {
              modelActionsAcc[actionName] = payload =>
                store.dispatch({
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

  const select = fieldNameOrSelectorFn => {
    if (typeof fieldNameOrSelectorFn === 'string') {
      return store.state[name][fieldNameOrSelectorFn];
    } else {
      return fieldNameOrSelectorFn(store.state);
    }
  };

  return {
    select,
    actions: allActions[name].actions,
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

  const m = models.reduce((acc, model) => {
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
    models: m,
  };
};

export const effect = fn => ({
  is: 'EFFECT',
  fn,
});

export const fetchableReducer = field => (state, action) => ({
  ...state,
  [field]: { ...state[field], ...action.payload },
});

export const fetchable = {
  loading: { status: 'LOADING' },
  error: error => ({ error, status: 'FAILURE' }),
  success: data => ({ data, status: 'SUCCESS', error: null }),
  reducer: fetchableReducer,
  value: initialValue => ({
    data: initialValue,
    error: null,
    status: 'INITIAL',
  }),
};
