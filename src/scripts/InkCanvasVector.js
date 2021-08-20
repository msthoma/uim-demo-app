import { InkCanvas2D, StrokeRenderer2D, utils } from 'digital-ink';

import InkCanvas from './InkCanvas';
import Lens from './Lens';
import layout from './layout/Layout';
import SelectionVector from './selection/SelectionVector';
import { config } from './Config';

class InkCanvasVector extends InkCanvas {
  constructor(canvas, width, height, app) {
    super(app);

    this.canvas = InkCanvas2D.createInstance(canvas, width, height);
    this.strokesLayer = this.canvas.createLayer();
    this.originLayer = this.canvas.createLayer();

    this.strokeRenderer = new StrokeRenderer2D(this.canvas);
    this.strokeRendererOrigin = new StrokeRenderer2D(this.canvas, {
      width: this.originLayer.width,
      height: this.originLayer.height,
    });

    // Zoom behavior
    this.lens = new Lens(this.canvas, {
      refresh: transform => {
        this.canvas.clear();
        this.canvas.blend(this.originLayer, { transform });

        layout.updatePaper(transform);
      },
      redraw: utils.debounce(transform => {
        this.preventOriginRedraw = true;

        this.strokeRenderer.setTransform(transform);
        this.redraw();

        this.preventOriginRedraw = false;
      }, 300),
      abort: this.abort.bind(this),
    });

    this.lens.modelBounds = this.originLayer.bounds;
    layout.setPaperSize(this.originLayer.width, this.originLayer.height);

    this.selection = new SelectionVector(this.dataModel, {
      modelSize: this.originLayer.bounds,
      lens: this.lens,
      canvas: this.canvas,
      redraw: this.redraw.bind(this),
    });

    this.selection.connect();
  }

  async setTool(toolID) {
    super.setTool(toolID);

  }

  setColor(color) {
    super.setColor(color);
  }

}

export default InkCanvasVector;
