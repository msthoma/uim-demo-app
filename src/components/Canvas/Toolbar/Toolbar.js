import { useState } from 'react';

import layout from '../../../scripts/layout/Layout';
import Tool from './Tool/Tool';

import classes from './Toolbar.module.scss';

// Configures the tools that are selectable in the toolbar
import { ReactComponent as PenIcon } from '../../../images/icons/pen.svg';
import { ReactComponent as MarkerIcon } from '../../../images/icons/marker.svg';
import { ReactComponent as BrushIcon } from '../../../images/icons/brush.svg';
import { ReactComponent as ColorIcon } from '../../../images/icons/color-picker.svg';
import { ReactComponent as EraserIcon } from '../../../images/icons/eraser.svg';
import { ReactComponent as SelectionIcon } from '../../../images/icons/selection.svg';
import { ReactComponent as DownloadIcon } from '../../../images/icons/download.svg';
import { ReactComponent as UploadIcon } from '../../../images/icons/upload.svg';
import { ReactComponent as ProcessingIcon } from '../../../images/icons/processing.svg';
import axios from 'axios';

const Toolbar = () => {
  const [color, setColor] = useState('#4A4A4A');

  const tools = [
    {
      id: 'pen',
      Icon: PenIcon,
    },
    {
      id: 'marker',
      Icon: MarkerIcon,
    },
    {
      id: 'brush',
      Icon: BrushIcon,
    },
  ];

// Handler for the processing
  const processingHandler = async () => {
    const { WILL } = window.app;

    const bytes = await WILL.encode();
    console.log('Ink content encoded as UIM  v3.1.0.');
    //const url = 'http://uim-demo-backend.herokuapp.com/process';
    const url = 'http://localhost:8000/process';
    // Additional parameters for the service need to be added here:
    var formdata = new FormData();
    formdata.append('uim_file', new Blob([bytes]), 'ink.uim');

    console.log('Sending UIM request to: ' + url);
    const response = await axios.post(url, formdata, {
      headers: {
      },
      responseType: 'arraybuffer',
    });

    const buffer = response.data;
    console.log('Response of the REST API received.');
    // Response of the service is a Universal Ink Model with the recognition results
    WILL.openFile(buffer);
  };

  return (
    <div className={classes.Toolbar}>
      <div className={classes.TitleContainer}>
        <h2 className={classes.Title}>Tools</h2>
      </div>
      <nav className={classes.ToolsContainer}>
        {tools.map((tool, index) => {
          return <Tool key={index} id={tool.id} Icon={tool.Icon} selectable />;
        })}
        <input
          id="change_color"
          type="color"
          value={color}
          onChange={e => {
            layout.selectColor(e.target);
            setColor(e.target.value);
          }}
          style={{ position: 'absolute', bottom: 0, left: 0, opacity: 0 }}
        />
        <label
          htmlFor="change_color"
          style={{
            width: '3rem',
            height: '3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 0,
            cursor: 'pointer',
          }}
        >
          <ColorIcon fill={color} />
        </label>
        <Tool id="eraserWholeStroke" Icon={EraserIcon} selectable />
        <Tool id="selectorWholeStroke" Icon={SelectionIcon} selectable />
      </nav>
      <div className={classes.RightSection}>
        <Tool
          id="download"
          Icon={DownloadIcon}
          onClick={() => {
            const { WILL } = window.app;
            WILL.save();
          }}
          customSVGDimensions={{ width: '25px' }}
        />
        <label htmlFor="upload_uim">
          <Tool
            id="upload"
            Icon={UploadIcon}
            customSVGDimensions={{ width: '25px' }}
        />
        </label>
        <input
          type="file"
          id="upload_uim"
          style={{ display: 'none' }}
          onChange={e => {
            const { WILL } = window.app;
            WILL.import(e.target, 'uim');
          }}
        />
        <Tool
          id="process"
          Icon={ProcessingIcon}
          onClick={processingHandler}
          customSVGDimensions={{ width: '25px' }}
        />
      </div>
    </div>
  );
};

export default Toolbar;
