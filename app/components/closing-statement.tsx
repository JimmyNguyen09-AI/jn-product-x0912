import { storyCopy } from "../content";
export default function ClosingStatement() {
  const [first, second] = storyCopy.closing;
  const space = second.indexOf(" ");
  return (
    <section
      id="unwritten"
      className="closing"
      aria-labelledby="closing-heading"
    >
      <h2 id="closing-heading">
        <span>{first}</span>
        <span>
          {second.slice(0, space)} <em>{second.slice(space + 1)}</em>
        </span>
      </h2>
    </section>
  );
}
