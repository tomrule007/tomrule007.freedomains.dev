import React from 'react';

const HighlightText = ({ highlight, text }) => {
  if (!highlight) return <>{text}</>;

  const parts = String(text).split(new RegExp(`(${highlight})`, 'gi'));

  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span className="match" key={i}>
            {part}
          </span>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
};

export default HighlightText;
