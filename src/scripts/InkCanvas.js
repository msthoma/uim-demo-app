import {
  InkController,
  InkBuilder,
  InkCodec,
  InputListener,
  BrushGL,
  Brush2D,
  Stroke,
  fsx,
} from 'digital-ink';

import { config } from './Config';
import SelectionVector from './selection/SelectionVector';

class InkCanvas extends InkController {
  constructor(app) {
    super();

    this.app = app;
    this.builder = new InkBuilder();

    this.builder.onComplete = pathPart => {
      if (this.intersector) this.erase(pathPart);
      else if (this.selector) this.select(pathPart);
      else this.draw(pathPart);
    };

    this.dataModel = this.app.model;

    Object.defineProperty(this, 'strokes', {
      get: () => this.dataModel.inkModel.content,
      enumerable: true,
    });
    Object.defineProperty(this, 'transform', {
      get: () => this.lens.transform,
      set: value => (this.lens.transform = value),
      enumerable: true,
    });

    this.codec = new InkCodec();
  }

  init(device, toolID, color) {
    this.builder.device = device;

    this.setTool(toolID);
    this.setColor(color);
  }

  setTool(toolID) {
    this.toolID = toolID;

    this.intersector = config.tools[toolID].intersector;
    this.selector = config.tools[toolID].selector;
  }

  setColor(color) {
    this.color = color;
  }

  registerInputProvider(pointerID, isPrimary) {
    if (Array.isArray(pointerID)) {
      // multi-touch should handle all changedTouches and to assign builders for each other
      if (isNaN(this.builder.pointerID)) this.builder.pointerID = pointerID.first;
    } else {
      if (isPrimary) this.builder.pointerID = pointerID;
    }
  }

  getInkBuilder(pointerID) {
    if (Array.isArray(pointerID)) {
      if (pointerID.length > 0 && !pointerID.includes(this.builder.pointerID)) return undefined;
      return this.builder;
    } else return this.builder.pointerID === pointerID ? this.builder : undefined;
  }

  reset(sensorPoint) {
    try {
      let options = config.getOptions(sensorPoint, this.toolID, this.color);

      this.builder.configure(options.inkBulder);
      this.strokeRenderer.configure(options.strokeRenderer);

      if (this.intersector) {
        this.intersector.reset(this.dataModel.manipulationsContext);

        this.builder.pathProducer.prediction = false;
      } else this.builder.pathProducer.prediction = this.app.prediction;

      if (this.selector) this.selector.reset(this.dataModel.manipulationsContext);
    } catch (e) {
      console.log('error: ', e.message);
    }
  }

  begin(sensorPoint) {
    try {
      this.reset(sensorPoint);

      this.builder.add(sensorPoint);
      this.builder.build();
    } catch (e) {
      console.log('error: ', e.message);
    }
  }

  move(sensorPoint, prediction) {
    try {

      if (this.app.downsampling && this.requested) {
        this.builder.ignore(sensorPoint);
        return;
      }

      this.builder.add(sensorPoint, this.app.pointerPrediction ? prediction : undefined);

      if (!this.requested) {
        this.requested = true;

        this.builder.build();

        requestAnimationFrame(() => (this.requested = false));
      }
    } catch (e) {
      console.log('error: ', e.message);
    }
  }

  end(sensorPoint) {
    this.builder.add(sensorPoint);
    this.builder.build();
  }

  draw(pathPart) {
    this.drawPath(pathPart);

    if (pathPart.phase === InkBuilder.Phase.END) {
      if (this.strokeRenderer) {
        let stroke = this.strokeRenderer.toStroke(this.builder);
        this.dataModel.add(stroke);

        this.drawOrigin(stroke);
      }
    }
  }

  drawPath(pathPart) {
    this.strokeRenderer.draw(pathPart.added, pathPart.phase === InkBuilder.Phase.END);

    if (pathPart.phase === InkBuilder.Phase.UPDATE) {
      this.strokeRenderer.drawPreliminary(pathPart.predicted);

      let dirtyArea = this.canvas.bounds.intersect(this.strokeRenderer.updatedArea);

      if (dirtyArea) this.present(dirtyArea, pathPart.phase);
    } else if (pathPart.phase === InkBuilder.Phase.END) {
      if (!this.strokeRenderer.strokeBounds) return;
      if (this.selector || this.intersector || this.toolID === 'selector') return;

      let dirtyArea = this.canvas.bounds.intersect(
        this.strokeRenderer.strokeBounds.union(this.strokeRenderer.updatedArea)
      );

      if (dirtyArea) this.present(dirtyArea, pathPart.phase);
    }
  }

  present(dirtyArea, phase) {
    if (phase === InkBuilder.Phase.END) this.strokeRenderer.blendStroke(this.strokesLayer);

    this.canvas.clear(dirtyArea);
    this.canvas.blend(this.strokesLayer, { rect: dirtyArea });

    if (phase === InkBuilder.Phase.UPDATE) this.strokeRenderer.blendUpdatedArea();
  }

  erase(pathPart) {
    if (this.toolID === 'eraserStroke') {
      this.drawPath(pathPart);

      this.intersector.updateSegmentation(pathPart.added);

      if (pathPart.phase === InkBuilder.Phase.END) {
        let intersection = this.intersector.intersectSegmentation(this.builder.getInkPath(true));
        this.split(intersection);

        this.abort();
      }
    } else {
      let intersection = this.intersector.intersect(pathPart.added);
      this.split(intersection);
    }
  }

  split(intersection) {
    let split = this.dataModel.update(intersection.intersected, intersection.selected);
    let dirtyArea = split.dirtyArea;

    if (dirtyArea) {
      dirtyArea.model = true;
      this.redraw(dirtyArea);
    }
  }

  select(pathPart) {
    this.drawPath(pathPart);

    if (this.selection instanceof SelectionVector) this.selector.updateSegmentation(pathPart.added);

    if (pathPart.phase === InkBuilder.Phase.END) {
      let stroke = this.strokeRenderer.toStroke(this.builder, true);

      this.abort();
      this.selection.open(stroke, this.selector);
    }
  }

  abort() {
    if (!this.builder.phase) return;

    let dirtyArea;

    if (this.strokeRenderer.strokeBounds)
      dirtyArea = this.strokeRenderer.strokeBounds.union(this.strokeRenderer.updatedArea);

    this.strokeRenderer.abort();
    this.builder.abort();

    if (dirtyArea) this.refresh(dirtyArea, true);
  }

  resize(reason) {
    let wrapper = document.querySelector('.Wrapper');
    let width = wrapper.offsetWidth;
    let height = wrapper.offsetHeight;

    this.canvas.resize(width, height);
    this.resizeStack(width, height);

    this.lens.focus();

    if (
      reason === InputListener.ResizeReason.ZOOM_OUT ||
      reason === InputListener.ResizeReason.ORIENTATION
    )
      this.redraw();
    else this.refresh();
  }

  resizeStack(width, height) {
    Array.from(this.canvas.surface.parentNode.querySelectorAll('canvas'))
      .filter(node => node !== this.canvas.surface)
      .forEach(canvas => {
        canvas.width = width;
        canvas.height = height;
      });
  }

  redraw(dirtyArea, excludedStrokes = []) {
    let modelArea;
    let viewArea;

    if (dirtyArea) {
      modelArea = dirtyArea.model ? dirtyArea : this.lens.viewToModel(dirtyArea);
      viewArea = dirtyArea.model ? this.lens.modelToView(dirtyArea) : dirtyArea;

      viewArea = viewArea.intersect(this.canvas.bounds);
    } else viewArea = this.canvas.bounds;

    this.strokesLayer.clear(viewArea);
    this.clearOrigin(modelArea);

    let strokes = this.strokes.filter(
      stroke =>
        !excludedStrokes.includes(stroke) &&
        stroke.style.visibility &&
        (!modelArea || stroke.bounds.intersect(modelArea))
    );

    this.strokeRenderer.blendStrokes(
      strokes,
      this.strokesLayer,
      { rect: viewArea },
      undefined
    );
    this.drawOrigin(strokes, modelArea);
    this.refresh(viewArea);
  }

  clearOrigin(modelArea) {
    if (this.preventOriginRedraw) return;
    this.originLayer.clear(modelArea);
  }

  drawOrigin(strokes, modelArea) {
    if (!this.originLayer || this.preventOriginRedraw) return;
    if (strokes instanceof Stroke) strokes = [strokes];

    this.strokeRendererOrigin.blendStrokes(
      strokes,
      this.originLayer,
      { rect: modelArea },
      undefined
    );
  }

  refresh(dirtyArea = this.canvas.bounds) {
    this.canvas.clear(dirtyArea);
    this.canvas.blend(this.strokesLayer, { rect: dirtyArea });
  }

  clear() {
    this.clearOrigin();
    this.strokesLayer.clear();
    this.canvas.clear();

    this.dataModel.reset();
    this.lens.reset();
  }

  import(input, type) {
    let reader = new FileReader();

    if (type === 'uim') reader.onload = e => this.openFile(e.target.result);
    else if (type === 'tool') reader.onload = e => this.importTool(e.target.result);
    else throw new Error(`Unknown or missing import type - ${type}`);

    reader.readAsArrayBuffer(input.files[0]);

    input.value = '';
  }

  async encode() {
    return await this.codec.encodeInkModel(this.dataModel.inkModel);
  }

  decode(buffer) {
    return this.codec.decodeInkModel(buffer);
  }

  async save() {
    let buffer = await this.encode();
    fsx.saveAs(buffer, 'ink.uim', 'application/vnd.wacom-ink.model');
  }

  async openFile(buffer) {
    let inkModel = await this.codec.decodeInkModel(buffer);

    let error;

    if (
      localStorage.getItem('sample') === 1 &&
      inkModel.brushes.filter(brush => brush instanceof BrushGL).length > 0
    )
      error =
        'Ink object provides raster configuration. Select sample different from this one to use it.';

    if (
      localStorage.getItem('sample') === 2 &&
      inkModel.brushes.filter(brush => brush instanceof Brush2D).length > 0
    )
      error =
        'Ink object provides vector configuration. Select sample different from this one to use it.';

    if (error) {
      alert(error);
      return;
    }

    this.clear();

    let { brushes, strokes } = inkModel;

    for (let i = 0; i < strokes.length; i++) {
      let stroke = strokes[i];
      stroke.target = Stroke.Target['2D'];

      await stroke.init();
    }

    for (let brush of brushes) {
      if (brush instanceof BrushGL) await brush.configure(await this.getGLContext());
    }

    this.dataModel.importModel(inkModel);
    this.redraw();
  }
}

export default InkCanvas;
