const Tool = ({
  id,
  Icon,
  selectable = false,
  disabled = false,
  onClick = null,
  children,
  customSVGDimensions = null,
  customIconStyles = null,
}) => {
  const toolClasses = ['Tool'];

  if (selectable) {
    toolClasses.push('Selectable');
  }
  if (disabled) {
    toolClasses.push('Disabled');
  }

  return (
    <div className={toolClasses.join(' ')} id={id} onClick={onClick}>
      {customSVGDimensions ? (
        <Icon
          width={customSVGDimensions?.width}
          height={customSVGDimensions?.height}
          styles={{ customIconStyles }}
        />
      ) : (
        <Icon />
      )}
      {children}
    </div>
  );
};

export default Tool;
