import * as React from 'react';
import reactSvg from 'assert/react.svg'
type Props = {
  onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => any,
};

function FloatingActionButton({onClick}: Props) {
  return (
    <div onClick={onClick}>
      <img width={32} height={32} src={reactSvg} alt="menu" />
    </div>
  );
};

export default FloatingActionButton