import React, { useState, useReducer, useEffect } from 'react';

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIRST_NAME':
      return { ...state, firstName: action.payload };
    case 'SET_LAST_NAME':
      return { ...state, lastName: action.payload };
    default:
      return state;
  }
};

const useWindowResize = dep => {
  useEffect(
    () => {
      const handleResize = () => {
        console.log('DIM:', window.innerHeight, window.innerWidth);
      };

      console.log('ADDED');
      window.addEventListener('resize', handleResize);

      return () => {
        console.log('CLEANUP');
        window.removeEventListener('resize', handleResize);
      };
    },
    [dep]
  );
};

const useFetchData = (state) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('https://httpbin.org/delay/1')
      .then(res => res.json())
      .then(x => {
        setData(x)
      });
  }, [state]);

  return data;
};

const Hook = () => {
  const [state, dispatch] = useReducer(reducer, {
    firstName: '1',
    lastName: '2',
  });

  // DO NOT DO THIS
  useWindowResize(state.firstName);

  const data = useFetchData(state);

  return (
    <div>
      <span>{state.firstName}</span>
      <span>{state.lastName}</span>
      <button
        onClick={() =>
          dispatch({ type: 'SET_FIRST_NAME', payload: 'first!!!' })
        }
      >
        set first
      </button>
      <button
        onClick={() => dispatch({ type: 'SET_LAST_NAME', payload: 'last!!!' })}
      >
        set last
      </button>
      {!!data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
};

export default Hook;
