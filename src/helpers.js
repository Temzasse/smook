import React from 'react';

const commonLogStyles = 'padding: 2px; border-radius: 2px;';

export const log = {
  state: state => {
    console.log(
      '%c next ',
      `background: #b3ffaf; color: #063b04; ${commonLogStyles}`,
      state
    );
  },
  action: (action, state) => {
    console.group(`${action.type}`);
    console.log(
      '%c prev ',
      `background: #00d8ff; color: #022126; ${commonLogStyles}`,
      state
    );
    console.log(
      '%c payload ',
      `background: #ffbcff; color: #360436; ${commonLogStyles}`,
      action.payload
    );
    console.groupEnd();
  },
};

const reducer = () => Object.create(null);
export const useForceUpdate = () => {
  const [, dispatch] = React.useReducer(reducer, Object.create(null));
  const memoizedDispatch = React.useCallback(() => {
    dispatch(null);
  }, [dispatch]);
  return memoizedDispatch;
};

const guid = () => {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};

// Use `__ID__` hash to keep track of changed models when state is updated
export const updateId = state => ({ ...state, __ID__: guid() });

export const getChangedModels = (prev, next) => {
  return Object.entries(next)
    .map(([key, nextStateVal]) => {
      const prevStateVal = prev[key];
      return nextStateVal.__ID__ !== prevStateVal.__ID__ ? key : null;
    })
    .filter(Boolean);
};
