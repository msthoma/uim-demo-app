import { InputDevice, InputListener } from 'digital-ink';

import layout from './layout/Layout';
import InkCanvasVector from './InkCanvasVector';
import { config } from './Config';
import DataModel from './DataModel';

const { $ } = window;

class DigitalInkApp {

  initInkController = async (wrapper, canvas) => {
    this.model = new DataModel();

    try {
      let device = await InputDevice.createInstance({
        'app.id': 'uim-demo-app',
        'app.version': '1.0.0',
      });

      Object.defineEnum(this, 'Type', ['VECTOR']);

      let width = wrapper.offsetWidth;
      let height = wrapper.offsetHeight;
      let color = layout.extractColor($('nav #change_color')[0]);

      let toolID = 'pen';
      canvas.className = 'vector-canvas';

      config.tools.eraser = config.tools.eraserVector;

      Object.defineProperty(this, 'type', { value: this.Type.VECTOR, enumerable: true });

      let inkCanvas = new InkCanvasVector(canvas, width, height, this);

      await inkCanvas.init(device, toolID, color);

      Object.defineProperty(this, 'inkCanvas', { value: inkCanvas, enumerable: true });
      window.WILL = inkCanvas;

      inkCanvas.resizeStack(width, height);

      this.WILL = inkCanvas;
      layout.selectTool(inkCanvas.toolID);

      InputListener.open(inkCanvas);
    } catch (e) {
      console.error(e);
    }
  };

  redirect(sample) {
    if (!sample) localStorage.removeItem('sample');
    else localStorage.setItem('sample', sample);

    window.location.reload();
  }

  static disableZoom = () => {
    var keyCodes = [61, 107, 173, 109, 187, 189];

    window.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && keyCodes.indexOf(e.which) !== -1) e.preventDefault();
    });

    window.addEventListener(
      'DOMMouseScroll',
      function (e) {
        if (e.cancelable && (e.ctrlKey || e.metaKey)) e.preventDefault();
      },
      { passive: false }
    );

    window.addEventListener(
      'mousewheel',
      function (e) {
        if (e.cancelable && (e.ctrlKey || e.metaKey)) e.preventDefault();
      },
      { passive: false }
    );

    window.addEventListener(
      'wheel',
      function (e) {
        if (e.cancelable && (e.ctrlKey || e.metaKey)) e.preventDefault();
      },
      { passive: false }
    );

    // prevents Scribble for iOS
    window.addEventListener(
      'touchmove',
      function (e) {
        e.preventDefault();
      },
      { passive: false }
    );
  };
}

export default DigitalInkApp;
