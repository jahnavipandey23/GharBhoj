import DishImage from './DishImage';
import { inr } from '../utils/format';

export default function DishCard({ dish, onAdd }) {
  return (
    <div className="dc">
      <DishImage dish={dish} />
      <h3>{dish.name}</h3>
      <p>{dish.description}</p>
      <div className="ft">
        <b>{inr(dish.price)}</b>
        {dish.available
          ? <button className="pl" aria-label={`Add ${dish.name}`} onClick={() => onAdd(dish.id)}>+</button>
          : <span className="note">Sold out</span>}
      </div>
    </div>
  );
}
