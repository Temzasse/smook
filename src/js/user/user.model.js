import { effect, fetchable } from '../../smook';
import { sleep } from '../../helpers';

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
    login: state => ({
      ...state,
      isLoggedIn: true,
    }),

    logout: state => ({
      ...state,
      isLoggedIn: false,
    }),

    setProfile: fetchable.reducer('profile'),

    fetchProfile: effect(async function(models, getState, args) {
      try {
        models.user.actions.setProfile(fetchable.loading); // show loading spinner

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
        models.user.actions.setProfile(fetchable.error(error.message));
      }
    }),
  },
};

export default userModel;
