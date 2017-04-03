import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  daily_rate: DS.attr('number'),
  bookings: DS.hasMany('booking')
});
