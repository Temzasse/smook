export const log = {
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
