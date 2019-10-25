import {
  ProductPricingDirector,
  ProductPricingAdapter
} from 'meteor/unchained:core-pricing';
import soldItems from './soldItems';

const compoundInterest = (initialValue, interest, iterations) =>
  initialValue * (1 + interest) ** iterations;

// Prices are in cents, but we want to round to whole euros
const getRoundedPremium = (basePrice, nextPrice) =>
  Math.round(nextPrice / 100 - basePrice / 100) * 100;

class CompoundInterestPrice extends ProductPricingAdapter {
  static key = 'com.thisisnotacommercial.pricing';

  static version = '1.0';

  static label = '1% price increase for every sale';

  static orderIndex = 10;

  static isActivatedFor() {
    return true;
  }

  async calculate() {
    const { product, country } = this.context;
    const price = product.price({ country });

    const slug = product.slugs[0];

    const slugIncreaseMap = {
      postcard: 0.01,
      page: 0.04
    };

    const confirmedOrders = soldItems(slug);

    const nextPrice = compoundInterest(
      price.amount,
      slugIncreaseMap[slug],
      confirmedOrders
    );
    const premium = getRoundedPremium(price.amount, nextPrice);

    this.result.addItem({
      amount: premium,
      isTaxable: true,
      isNetPrice: true,
      meta: { adapter: this.constructor.key }
    });

    return super.calculate();
  }
}

ProductPricingDirector.registerAdapter(CompoundInterestPrice);

// eslint-disable-next-line import/prefer-default-export
export { soldItems };
