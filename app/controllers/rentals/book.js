import Ember from 'ember';

export default Ember.Controller.extend({

  actions: {
    close() {
      this.transitionToRoute('rentals')
    }
  }

});
