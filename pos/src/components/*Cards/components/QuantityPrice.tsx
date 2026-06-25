import { InputQuantity } from '../../Inputs/InputQuantity';
import { Price } from '../../Price/Price';

export const QuantityPrice = (p: { price: number; quantity: number }) => {
  return (
    <>
      <InputQuantity quantity={p.quantity} />

      <div className="card__price flex-row gap-1">
        <Price price={p.price * p.quantity} />
      </div>
    </>
  );
};
