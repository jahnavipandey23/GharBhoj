import { assetUrl } from '../api/client';

// Shows the dish photo from the backend, or a plain tile with the name when the dish has no photo.
export default function DishImage({ dish }) {
  return dish.image
    ? <img src={assetUrl(dish.image)} alt={dish.name} />
    : <div className="ph0">{dish.name}</div>;
}
