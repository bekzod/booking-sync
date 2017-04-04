import DS from 'ember-data';

export default DS.JSONAPIAdapter.extend({
  namespace: 'api',
  // headers: Ember.computed('session.authToken',  function () {
  //   return {
  //     'x-authentication': this.get('session.authToken')
  //   };
  // });

});
