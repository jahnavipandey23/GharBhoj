import { STATUS_LABEL } from '../utils/format';

export default function StatusBadge({ status }) {
  return <span className={`bd ${status}`}>{STATUS_LABEL[status]}</span>;
}
