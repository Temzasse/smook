import { Model, fetchable, FetchableValue } from 'smook';
import { effect } from '../smook.typed';
import { sleep } from '../helpers';
import { Profile } from './user.types';

export interface State {
  profile: FetchableValue<Profile>;
  isLoggedIn: boolean;
}

const userModel = {
  name: 'user',

  state: {
    profile: fetchable.value(null),
    isLoggedIn: false,
  },

  selectors: {
    getFullName: ({ user }) =>
      user.profile.data
        ? `${user.profile.data.firstName} ${user.profile.data.lastName}`
        : '',
  },

  actions: {
    login: (state: State) => ({
      ...state,
      isLoggedIn: true,
    }),

    logout: (state: State) => ({
      ...state,
      isLoggedIn: false,
    }),

    setProfile: fetchable.reducer<State, 'profile'>('profile'),

    fetchProfile: effect(async function(models, getState) {
      try {
        models.user.actions.setProfile(fetchable.loading()); // show loading spinner

        await sleep(); // mock API call

        const profile = {
          firstName: 'Teemu',
          lastName: 'Taskula',
          githubUrl: 'https://github.com/Temzasse',
        };

        models.user.actions.setProfile(fetchable.success(profile));

        await sleep(2000);

        const fullName = models.user.selectors.getFullName(getState());
        console.log('>>> full name', fullName);
      } catch (error) {
        console.log('> Error in fetchProfile', error);
        models.user.actions.setProfile(fetchable.failure(error.message));
      }
    }),
  },
};

export type UserModel = Model<typeof userModel, State>;

export default userModel;
