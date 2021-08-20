import { Brush2D, BrushPrototype, ShapeFactory, BrushGL } from 'digital-ink';
import URIBuilder from './URIBuilder';

let BrushPalette = {
	/* **************** VECTOR BRUSH configuration **************** */
	circle: new Brush2D(URIBuilder.getBrushURI("vector", "Circle"), [
		BrushPrototype.create(BrushPrototype.Type.CIRCLE, 0, 4),
		BrushPrototype.create(BrushPrototype.Type.CIRCLE, 2, 8),
		BrushPrototype.create(BrushPrototype.Type.CIRCLE, 6, 16),
		BrushPrototype.create(BrushPrototype.Type.CIRCLE, 18, 32)
	]),

	basic: new Brush2D(URIBuilder.getBrushURI("vector", "Basic"),
									   ShapeFactory.createCircle(3),
										 0.3),

	eraserGL: new BrushGL(URIBuilder.getBrushURI("raster", "Eraser"),
												"/images/textures/shape_circle.png",
												"/images/textures/essential_fill_8.png",
												{
													spacing: 0.1,
													rotationMode: BrushGL.RotationMode.NONE
												})
};

let ready = false;

BrushPalette.configure = async function(ctx) {
	if (ready) return;
	ready = true;

	let brushes = Object.values(BrushPalette).filter(value => value instanceof BrushGL);

	for (let brush of brushes)
		await brush.configure(ctx);
}

export default BrushPalette;
