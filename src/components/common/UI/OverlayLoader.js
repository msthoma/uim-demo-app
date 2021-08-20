import React from 'react';

import classes from './OverlayLoader.module.scss';

const OverlayLoader = ({
  customTitle = '',
  customSubtitle = '',
  customContent = '',
}) => {
  return (
    <div className={classes.Overlay}>
      {customContent || (
        <>
          <h3>{customTitle || 'Loading...'}</h3>
          <p>{customSubtitle ? customSubtitle : null}</p>
        </>
      )}
    </div>
  );
};

export default OverlayLoader;
