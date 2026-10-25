import { motion } from "../content";
export default function CloudTransition() {
  return (
    <div className="cloud-transition" aria-hidden="true">
      <div
        className="cloud-bank cloud-back"
        style={{ backgroundImage: `url(${motion.cloud.texture})` }}
      />
      <div
        className="cloud-bank cloud-left"
        style={{ backgroundImage: `url(${motion.cloud.texture})` }}
      />
      <div
        className="cloud-bank cloud-right"
        style={{ backgroundImage: `url(${motion.cloud.texture})` }}
      />
    </div>
  );
}
