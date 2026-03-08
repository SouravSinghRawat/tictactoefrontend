import React from 'react';

const TicTacToe = ({ board, onSquareClick }) => {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 100px)',
    gap: '10px',
    marginTop: '20px'
  };

  const squareStyle = {
    width: '100px',
    height: '100px',
    fontSize: '24px',
    cursor: 'pointer',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div style={gridStyle}>
      {board.map((symbol, index) => (
        <div
          key={index}
          style={squareStyle}
          onClick={() => onSquareClick(index)}
        >
          {symbol === 'EMPTY' ? '' : symbol}
        </div>
      ))}
    </div>
  );
};

export default TicTacToe;