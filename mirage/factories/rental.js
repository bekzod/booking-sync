import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  name() {
    return faker.address.city();
  },
  image: faker.image.city,
  dailyRate: faker.commerce.price
});
