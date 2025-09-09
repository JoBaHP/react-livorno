import React from "react";
import { BsFillPlayFill, BsPauseFill } from "react-icons/bs";

import "./Intro.css";

const Intro = () => {
  const [playVideo, setPlayVideo] = React.useState(false);
  const vidRef = React.useRef();

  return (
    <div className="app__video">
      <video
        ref={vidRef}
        src="/media/pizza.mp4"
        type="video/mp4"
        loop
        playsInline
        controls={false}
        muted
        preload="metadata"
        onLoadedMetadata={() => {
          try { vidRef.current.currentTime = 0.1; } catch (_) {}
        }}
      />
      <div className="app__video-overlay flex__center">
        <div
          className="app__video-overlay_circle flex__center"
          onClick={() => {
            setPlayVideo(!playVideo);
            if (playVideo) {
              vidRef.current.pause();
            } else {
              vidRef.current.play();
            }
          }}
        >
          {playVideo ? (
            <BsPauseFill color="#fff" fontSize={30} />
          ) : (
            <BsFillPlayFill color="#fff" fontSize={30} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Intro;
