import React from 'react';
import ReactDOM from 'react-dom';

function DropdownPortal({ children }) {
  return ReactDOM.createPortal(children, document.body);
}

export default DropdownPortal;
