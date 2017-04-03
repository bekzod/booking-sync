import DS from 'ember-data';

export default DS.JSONAPIAdapter.extend({

  // headers: Ember.computed('session.authToken',  function () {
  //   return {
  //     'x-authentication': this.get('session.authToken')
  //   };
  // });

});
