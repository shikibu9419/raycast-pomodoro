import { runJSInYouTubeMusicTab } from "./utils";

const PLAYING_LABEL = "一時停止";
const PAUSING_LABEL = "再生";

const playPauseButtonJS = "document.querySelector('#play-pause-button')";
const togglePlayingJS = `${playPauseButtonJS}.click();`;

export const play = () =>
  runJSInYouTubeMusicTab(`if (${playPauseButtonJS}.title === '${PAUSING_LABEL}') { ${togglePlayingJS} }`);

export const pause = () =>
  runJSInYouTubeMusicTab(`if (${playPauseButtonJS}.title === '${PLAYING_LABEL}') { ${togglePlayingJS} }`);

export const toggle = () => runJSInYouTubeMusicTab(togglePlayingJS);
