import React from "react";
import PropTypes from "prop-types";
import Node from "./Node";

function NodeTemplate({ pods, nodeName }) {
  return (
    <li>
      <div>
        <p>{nodeName}</p>
        <div>
          <Node pods={pods} />
        </div>
      </div>
    </li>
  );
}

NodeTemplate.defaultProps = {
  nodeName: "",
  pods: [],
};

NodeTemplate.propTypes = {
  nodeName: PropTypes.string,
  pods: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
};

export default NodeTemplate;
