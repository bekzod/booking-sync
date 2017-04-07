import DS from 'ember-data';

const { computed } = Ember

export default DS.Model.extend({
  rental: DS.belongsTo('rental'),
  startAt: DS.attr('date'),
  endAt: DS.attr('date'),
  price: DS.attr('number', { defaultValue: 0 }),
  clientEmail: DS.attr('string'),

  days: computed('startAt', 'endAt', function() {
    let days = 0
    let { startAt, endAt } = this.getProperties('startAt', 'endAt')
    if (startAt && endAt) {
      days = moment(endAt).diff(startAt, 'days')
    }
    return days
  })

});
