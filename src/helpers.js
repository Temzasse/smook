import React from 'react';

const logStyles = (color, bgColor) => `
  color: ${color};
  background: ${bgColor};
  padding: 0px;
  line-height: 15px;
  border-radius: 99px;
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  display: inline-block;
`;

export const log = {
  state: (state, changedModels = []) => {
    const mList = changedModels.join(', ');
    console.groupCollapsed('State updated');
    console.log('%c updated ', logStyles('#197813', '#9bfa96'), state);
    console.log('%c models ', logStyles('#4f5a8c', '#e9eaf0'), mList);
    console.groupEnd();
  },
  action: (action, state) => {
    console.groupCollapsed(`Action | ${action.type}`);
    console.log('%c current ', logStyles('#094d57', '#00d8ff'), state);
    console.log('%c payload ', logStyles('#871387', '#ffbcff'), action.payload);
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

export const getChangedModels = (prev, next) => {
  return Object.entries(next)
    .map(([key, nextStateVal]) => {
      const prevStateVal = prev[key];
      return Object.is(nextStateVal, prevStateVal) ? null : key;
    })
    .filter(Boolean);
};
