import DS from 'ember-data';

export default DS.Model.extend({
  rental: DS.belongsTo('rental'),
  startAt: DS.attr('date'),
  endAt: DS.attr('date'),
  price: DS.attr('number', { defaultValue: 0 }),
  clientEmail: DS.attr('string')
});
