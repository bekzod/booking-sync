import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('rental-item', 'Integration | Component | rental item', {
  integration: true
});

test('it renders', function(assert) {

  let rental = { name: 'great hotel', image: 'https://kittens/image.png', dailyRate: 12 }
  this.set('rental', rental)
  this.render(hbs`{{rental-item rental=rental}}`)

  assert.equal(this.$('.name').text().trim(), 'great hotel $12/day')
  assert.equal(this.$('img').prop('src'), 'https://kittens/image.png')
});
