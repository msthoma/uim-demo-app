# UIM Demo - Web App

**Wacom Ink Layer Language (WILL™)** is a cross-platform digital ink technology.
It is based on the needs of the end-user and Wacom's experience with different domains.
WILL allows you to include premium digital inking features in your applications.
It uses a modularized pipeline allowing each module to be configured, replaced, or omitted as required by the specific application, providing you with superior flexibility.

The newly introduced **Universal Ink Model** is a data model describing ink related data structures and meta-data concept to describe the semantic content of ink.
You can also use the file encoding of the Universal Ink Model to exchange ink content between applications and cross-platform.

# Getting Started

## Web Development Environment

To run the sample code first ensure you have installed the following:

* node.js e.g. download from [node.js](https://nodejs.org/en/download/)

## Download the SDK

The SDK v1.4 is only as preview available. Please contact me.

The downloaded Zip file contains the SDK ink engine accessed by the sample code.

## Using the WILL SDK Sample Code

* copy these folder from the downloaded SDK to the samples folder
    * *wacom/digital-ink*
* start a command prompt in the samples folder
* use the command ```npm install``` to create the node_modules folder


To start, run:

```
$ npm start
```

Now you can access the web-demo via:

```http://localhost:3000```


> **Note:**  We recommend starting with Chrome or Firefox browsers as some versions of Edge can be incompatible.

---

# Sample code description

The sample application demonstrates ink rendering through the use of WILL SDK for ink (v3.0) using a JavaScript implementation.
Moreover, it shows how the handling of ink data using the Universal Ink Model is realized.

Vector rendering is a technique that fills the stroke boundary of a path with solid color.


## Brush Tools

### Importing a brush tool

The **Ink Designer** provides an easy way to configure the parameters of a brush tool and the related pipeline configuration.

The [Ink Designer](http://developer-docs.wacom.com/sdk-for-ink/docs/ink-designer) page provides a link to the tool with supporting documentation.

Via its export function the tool can be downloaded and imported within the sample application.


## Ink Rendering

The ink geometry pipeline transforms pointer input data to ink geometry.
In the sample application the geometry pipeline is created and configured in the `InkCanvas` class.
`InkCanvasVector` extends the pipeline for vector 2D rendering.

In order to use the pipeline, you need to create a data layout that specifies the content of the ink paths.
Here is a basic ```layout``` where path points have X, Y coordinates and variable size:

```javascript
    var layout = [
        PathPoint.Property.X,
        PathPoint.Property.Y,
        PathPoint.Property.SIZE
    ];
```

The sample application adds more properties (including rotation, scale and offset).
*Config.js* provides several different sample configurations suitable for different input devices.

### The PathPoint Calculator

The `calculator` is a method that you pass to the `InkBuilder`.
It defines how data from pointer events are transformed to path points.
The sample application provides several examples of path point calculator methods, dependent from pointer input - pen, mouse or touch and provides proper data to ink builder.
They can be found in the *Config.js* script.

### Building Ink

In order to build ink in real time you need to handle pointer input events pointer-down, pointer-move, pointer-up and provide input to the `InkBuilder`.
The *On Begin* phase is selected to correspond to pointerType.
`drawPath` updates the canvas on every frame.
The `pathPart` provided from `InkBuilder` contains two collections - added and predicted (or preliminary) data.
The added data becomes a permanent part of the stroke, while predicted data is temporary and should be displayed only in the current frame.

`BrushPalette` defines some brushes.
`InkBuilder` needs to know what brush will be used for rendering.
Vector Inking needs a `PolygonBrush` which is used to define the brush shape.
The `spacing` parameter specifies the distance between different brush shapes along the path trajectory.

### Rendering Ink

Once the ink geometry is produced it can be displayed using `StrokeRenderer`.
It should be configured in the constructor.
There are two classes - `StrokeRenderer2D` and `StrokeRendererGL` that provide a similar interface.
It takes the parameter `canvas` which is used as the drawing surface.
The sample application shows efficient rendering of vector ink and particle ink in real time.

Real-time rendering is implemented in the sample application with a technique that uses several layers as raster cache.
The current stroke (added geometry) is stored in a "current stroke" layer.
New chunks are rasterized using `BlendMode.Max`.
The updated rectangle of the "current stroke" layer is copied to a "preliminary stroke" layer.
Then the polygon of the predicted stroke is rendered in the "preliminary stroke" layer, again with `BlendMode.Max`.
The scene "below" the updated area is reconstructed and then the updated piece is copied from the "preliminary stroke" layer to the "scene" layer.
Before presenting, the "scene" layer is copied to the canvas.

In the sample application, collection and rendering of ink is managed by the `StrokeRenderer`.
It creates and maintains the Graphics object and the various Layer objects.
It is configured with a vector brush or raster brush object to handle brush-specific parts of geometry production and rendering;
and receives input which is passed on to an InkBuilder via the Brush.

#### Rendering Vector Ink

The output from the geometry pipeline for vector ink is a pair of polygons which are rendered using the draw method of the `StrokeRenderer`.

## Ink Serialization

### Universal Ink Model

To serialize and deserialize the InkDocument - the data model within memory - the InkCodec is used.
`encodeInkDocument` encodes the `InkDocument` and produces a byte array encoding in the *.uim* file format described here: [Universal Ink Model](http://developer-docs.wacom.com/sdk-for-ink/docs/model)

To decode the content of the *.uim* file `decodeInkDocument` is used to create an `InkDocument`.

---

# Additional resources

## Sample Code
For further samples check Wacom's Developer additional samples, see [https://github.com/Wacom-Developer](https://github.com/Wacom-Developer)

## Documentation
For further details on using the SDK see [WILL SDK for ink documentation](http://developer-docs.wacom.com/sdk-for-ink/)

The API Reference is available directly in the downloaded SDK.

## Support
If you experience issues with the technology components, please see related [FAQs](http://developer-docs.wacom.com/faqs)

For further support file a ticket in our **Developer Support Portal** described here: [Request Support](http://developer-docs.wacom.com/faqs/docs/q-support/support)

## Developer Community
Join our developer community:

- [LinkedIn - Wacom for Developers](https://www.linkedin.com/company/wacom-for-developers/)
- [Twitter - Wacom for Developers](https://twitter.com/Wacomdevelopers)

## License
This sample code is licensed under the [MIT License](https://choosealicense.com/licenses/mit/)

---
