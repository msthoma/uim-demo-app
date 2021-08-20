import { useEffect, useRef, useState } from 'react';
import Toolbar from './Toolbar/Toolbar';
import DigitalInkApp from '../../scripts/app';
import layout from '../../scripts/layout/Layout';
import OverlayLoader from '../common/UI/OverlayLoader';

import classes from './Canvas.module.scss';

const Canvas = () => {
  const wrapperEl = useRef(null);
  const canvasEl = useRef(null);

  const [canvasLoading, setCanvasLoading] = useState({
    loading: false,
    loadingTitle: '',
    loadingSubtitle: '',
    progress: null,
  });

  useEffect(() => {
    let app = new DigitalInkApp();
    setCanvasLoading(prevState => ({
      ...prevState,
      loading: true,
      loadingTitle: 'Loading your canvas...',
    }));

    if (canvasEl && wrapperEl) {
      const initFn = async () => {
        try {
          layout.init();

          await app.initInkController(wrapperEl.current, canvasEl.current);

          window.app = app;
        } catch(e) {
          console.error(e);
        }

        setCanvasLoading(prevState => ({
          ...prevState,
          loading: false,
          loadingTitle: '',
          loadingSubtitle: '',
          progress: null,
        }));
      };

      initFn();
    }

    return app.closeInkController;
  }, [canvasEl, wrapperEl]);

  return (
    <div className={classes.Canvas}>
      <Toolbar />
      <div className={`${classes.Wrapper} Wrapper`} ref={wrapperEl}>
        <canvas
          className="layer-transforms"
          style={{ display: 'none' }}
          onContextMenu={e => e.preventDefault()}
        ></canvas>

        <canvas id="surface" onContextMenu={e => e.preventDefault()} ref={canvasEl}></canvas>

        <div className="selection selection-vector" style={{ display: 'none' }}></div>
      </div>
      {canvasLoading.loading ? (
        <OverlayLoader
          customTitle={canvasLoading.loadingTitle}
          customSubtitle={canvasLoading.loadingSubtitle}
          progress={canvasLoading.progress}
        />
      ) : null}
    </div>
  );
};

export default Canvas;
