import { useState, useEffect, useRef } from 'react';

const CANDY_EMOJIS = ['🍬', '🍭', '🍡', '🧁', '🍩'];

export function CandyPlaceholder({ seed = '' }) {
  const index = seed.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const emoji = CANDY_EMOJIS[index % CANDY_EMOJIS.length];
  return (
    <div className="candy-placeholder" aria-hidden="true">
      <span className="candy-placeholder__emoji">{emoji}</span>
    </div>
  );
}

export function CandyLoader() {
  return (
    <div className="candy-loader" aria-hidden="true">
      <div className="candy-loader__pop">
        <div className="candy-loader__shine" />
      </div>
      <div className="candy-loader__stick" />
    </div>
  );
}

export function CandyImageWrapper({ children, className }) {
  const [loaded, setLoaded] = useState(false);
  const wrapperRef = useRef(null);

  // On refresh the image may already be in cache, so onLoad never fires.
  // Check img.complete after mount to catch that case.
  useEffect(() => {
    const img = wrapperRef.current?.querySelector('img');
    if (img?.complete) setLoaded(true);
  }, []);

  return (
    <div className={`candy-image-wrapper${className ? ' ' + className : ''}`} ref={wrapperRef}>
      {!loaded && <CandyLoader />}
      <div
        className="candy-image-wrapper__img"
        style={{ opacity: loaded ? 1 : 0 }}
        onLoad={() => setLoaded(true)}
      >
        {children}
      </div>
    </div>
  );
}
