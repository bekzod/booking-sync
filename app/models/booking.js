import DS from 'ember-data';

export default DS.Model.extend({
  rental: DS.belongsTo('rental'),
  startAt: DS.attr('date'),
  endAt: DS.attr('date'),
  price: DS.attr('number'),
  clientEmail: DS.attr('string')
});
