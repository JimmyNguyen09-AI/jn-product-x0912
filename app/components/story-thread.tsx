import {threadPaths, threadState, type ThreadScene} from "../thread-config";
export default function StoryThread({scene}:{scene:ThreadScene}) {
  const initial=threadState(scene,0,0);
  const pathProps={pathLength:1,vectorEffect:"non-scaling-stroke" as const};
  return <svg className={`story-thread thread-${scene}`} data-thread={scene} data-broken="false" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
    {scene === "trust" ? <>
      <path {...pathProps} data-part="joined" d={initial.joined} className="thread-joined"/>
      <path {...pathProps} data-part="left" d={initial.left} className="thread-broken"/>
      <path {...pathProps} data-part="right" d={initial.right} className="thread-broken"/>
      <path {...pathProps} className="thread-tail" d="M430 558 C391 592 331 585 296 622 S269 681 270 704"/>
    </> : (["desktop","mobile"] as const).map(size=><g className={`thread-${size}`} key={size}>
      <path {...pathProps} d={threadPaths[scene][size]} className={scene === "bloom" ? "thread-knotted" : "thread-main"}/>
      {scene === "bloom" && <>
        <path {...pathProps} className="thread-loose" d={size === "desktop" ? "M270 55 C249 153 282 210 274 298 C265 405 264 583 330 625 S436 660 507 665" : "M224 65 C201 158 230 229 212 316 C195 423 199 585 264 631 S352 661 412 668"}/>
        <path {...pathProps} className="thread-gold" d={size === "desktop" ? "M507 665 C550 670 578 664 598 674 S607 683 610 686" : "M412 668 C453 674 495 665 547 682"}/>
      </>}
    </g>)}
  </svg>;
}
