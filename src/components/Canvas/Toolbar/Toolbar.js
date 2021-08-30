import { useState } from 'react';
import styled from "styled-components";
import layout from '../../../scripts/layout/Layout';
import Tool from './Tool/Tool';

import classes from './Toolbar.module.scss';

// Configures the tools that are selectable in the toolbar
import { ReactComponent as PenIcon } from '../../../images/icons/pen.svg';
// import { ReactComponent as MarkerIcon } from '../../../images/icons/marker.svg';
import { ReactComponent as BrushIcon } from '../../../images/icons/brush.svg';
import { ReactComponent as ColorIcon } from '../../../images/icons/color-picker.svg';
import { ReactComponent as EraserIcon } from '../../../images/icons/eraser.svg';
// import { ReactComponent as SelectionIcon } from '../../../images/icons/selection.svg';
import { ReactComponent as DownloadIcon } from '../../../images/icons/download.svg';
import { ReactComponent as RedoIcon } from '../../../images/icons/redo.svg';
import { ReactComponent as ProcessingIcon } from '../../../images/icons/processing.svg';
import axios from 'axios';

import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

const theme = {
  blue: {
    default: "#3f51b5",
    hover: "#283593"
  },
  pink: {
    default: "#e91e63",
    hover: "#ad1457"
  }
};

const Button = styled.button`
  background-color: ${(props) => theme[props.theme].default};
  color: white;
  padding: 5px 15px;
  border-radius: 5px;
  outline: 0;
  text-transform: uppercase;
  margin: 10px 15px;
  cursor: pointer;
  box-shadow: 0px 2px 2px lightgray;
  transition: ease background-color 250ms;
  &:hover {
    background-color: ${(props) => theme[props.theme].hover};
  }
  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`;

Button.defaultProps = {
  theme: "blue"
};

function clickMe() {
  alert("You clicked me!");
}

const options = [{value: 14, label: '零 (0)'},
{value: 0	, label: '一 (1)'},
{value: 5	, label: '二 (2)'},
{value: 3	, label: '三 (3)'},
{value: 12, label: '四 (4)'},
{value: 6	, label: '五 (5)'},
{value: 9	, label: '六 (6)'},
{value: 1	, label: '七 (7)'},
{value: 8	, label: '八 (8)'},
{value: 4	, label: '九 (9)'},
{value: 10, label: '十 (10)'},
{value: 13, label: '百 (100)'},
{value: 11, label: '千 (1000)'},
{value: 2	, label: '万 (10000)'},
{value: 7	, label: '亿 (100000000)'}];

const defaultOption = options[0];

const Toolbar = () => {

  // state = {
  //   feedback: 'something'
  // }

  const [color, setColor] = useState('#4A4A4A');

  const [feedback, setFeedback] = useState("");

  const tools = [
    {
      id: 'pen',
      Icon: PenIcon,
    },
    // {
    //   id: 'marker',
    //   Icon: MarkerIcon,
    // },
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
    
    const url = 'https://uim-backend-ssda.herokuapp.com/process';

    // Additional parameters for the service need to be added here:
    var formdata = new FormData();
    formdata.append('expected_index', 5);
    formdata.append('uim_file', new Blob([bytes]), 'ink.uim');

    console.log('Sending UIM request to: ' + url);
    const response = await axios.post(url, formdata, {
      headers: {
      },
      // responseType: 'int',
    });

    const buffer = response.data;
    console.log('Response of the REST API received.');
    // console.log(buffer["acc"]);
    setFeedback(buffer["acc"]);
    // Response of the service is a Universal Ink Model with the recognition results
    // WILL.openFile(buffer);
  };

  return (
    <div className={classes.Toolbar}>
      <div className={classes.TitleContainer}>
        <div>
          <h2 className={classes.Title}>  <b> DCh<sup>2</sup>P </b> </h2>
          <br />
          SSDA2021 - Hackathon - Group 1
        </div>        
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
        {/* <Tool id="eraserWholeStroke" Icon={EraserIcon} selectable /> */}
        {/* <Tool id="selectorWholeStroke" Icon={SelectionIcon} selectable /> */}
        <Tool
          id="process"
          Icon={RedoIcon}
          onClick={_ => {
            const { WILL } = window.app;
            setFeedback("");
            WILL.clear();
            // WILL.import(e.target, 'uim');
          }}
          customSVGDimensions={{ width: '35px' }}
        />
        <div> <h2>  Select character:</h2> </div>
        <Dropdown options={options} value={defaultOption} placeholder="Select an option" />
        <Button onClick={processingHandler}>Submit!</Button>
      </nav>
      <div className={classes.RightSection}>
        {/* <Tool
          id="download"
          Icon={DownloadIcon}
          onClick={() => {
            const { WILL } = window.app;
            WILL.save();
          }}
          customSVGDimensions={{ width: '25px' }}
        /> */}
        {/* 
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
        /> */}
        {/* <Tool
          id="process"
          Icon={ProcessingIcon}
          onClick={processingHandler}
          customSVGDimensions={{ width: '25px' }}
        /> */}
        <div><h2>{feedback}</h2></div>
      </div>
    </div>
  );
};

export default Toolbar;
