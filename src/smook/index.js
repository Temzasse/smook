import React from 'react';

// TODO: come up with a cooler name :p
// Smook -> State Management hOOk

const Context = React.createContext({});

export const StoreProvider = ({ store, children }) => {
  const { rootReducer, initialState, models } = store;
  const [state, dispatch] = React.useReducer(rootReducer, initialState);

  // TODO: is there a better way to log prev + next state?
  React.useEffect(() => {
    console.log('%c state ', 'background: #b3ffaf; color: #12510f', state);
  }, [state]);

  const loggedDispatch = action => {
    console.group(`${action.type}`);
    console.log('%c prev ', 'background: #99dbff; color: #134966', state);
    console.log('%c action ', 'background: #ffbcff; color: #440a44', action);
    console.groupEnd();
    dispatch(action);
  };

  return (
    <Context.Provider value={{ state, dispatch: loggedDispatch, models }}>
      {children}
    </Context.Provider>
  );
};

// TODO: can we bail out of unnecessary renders?
export const useModel = name => {
  const store = React.useContext(Context);
  const model = store.models[name];
  const { state, dispatch } = store;
  const getState = () => state;

  const actions = React.useMemo(() => {
    return Object.entries(model.actions).reduce((acc, [key, value]) => {
      if (value.is === 'EFFECT') {
        acc[key] = (...args) => {
          dispatch({ type: key, payload: args });
          return value.fn(
            { actions: acc, selectors: model.selectors },
            getState,
            ...args
          );
        };
      } else {
        acc[key] = payload => dispatch({ type: key, payload });
      }
      return acc;
    }, {});
  }, []); // Having no deps here should be ok?

  const select = fieldNameOrSelectorFn => {
    if (typeof fieldNameOrSelectorFn === 'string') {
      return state[model.name][fieldNameOrSelectorFn];
    } else {
      return fieldNameOrSelectorFn(state);
    }
  };

  return {
    actions,
    select,
    selectors: model.selectors,
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
        acc[name] = fn;
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
