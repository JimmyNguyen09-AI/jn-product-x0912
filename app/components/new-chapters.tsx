import { storyCopy } from "../content";
import { Beats, Media } from "./scene-media";
import { Reveal } from "./motion-system";
import { SceneReadingLink } from "./margin-notes";
import FamilyAlbum from "./family-album";

export function AlmostUs() {
  return <section id="almost-us" tabIndex={-1} className="scene love" data-scene="love" aria-labelledby="love-heading">
    <div className="scene-inner">
      <Media name="love" />
      <header className="love-heading"><p className="chapter-label">Chương 4 / Tình yêu dang dở</p><h2 id="love-heading" className="annotation">Almost, us.</h2></header>
      <Beats lines={storyCopy.love}/>
      <SceneReadingLink topic="love" />
    </div>
  </section>;
}
export function FamilyChapter() {
  return <section id="family" tabIndex={-1} className="family-chapter" aria-labelledby="family-heading">
    <Reveal><header className="family-heading"><p className="chapter-label">Chương 5 / Gia đình</p><h2 id="family-heading">The people<br/>who made me.</h2><p>Through every version of me, they were there.</p></header></Reveal>
    <FamilyAlbum/>
    <Reveal><p className="family-afterword">I was growing,<br/>with more love around me than I knew.</p></Reveal>
  </section>;
}
