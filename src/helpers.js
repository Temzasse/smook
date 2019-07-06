import React from 'react';

const logStyles = (color, bgColor) => `
  color: ${color};
  background: ${bgColor};
  padding: 1px 0px;
  line-height: 11px;
  border-radius: 99px;
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
`;

export const log = {
  state: state => {
    console.log('%c next ', logStyles('#197813', '#9bfa96'), state);
  },
  action: (action, state) => {
    console.group(`${action.type}`);
    console.log('%c prev ', logStyles('#094d57', '#00d8ff'), state);
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
