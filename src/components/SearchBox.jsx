import React from "react";

function SearchBox(props) {
  return (
    <div className="pa2">
      <input className="pa3 ba b--green bg-grey" type="search" placeholder="search pokemon" onChange={props.searchChange} />
    </div>
  );
}

export default SearchBox;
