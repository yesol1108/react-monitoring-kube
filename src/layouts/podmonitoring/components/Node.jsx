import React from "react";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";

function Node({ pods }) {
  if (pods.length === 0) {
    return null;
  }
  return (
    <ul style={{ display: "flex", flexWrap: "wrap" }}>
      {/* eslint-disable-next-line no-unused-vars */}
      {pods.map((pod) => (
        <li
          style={{
            position: "relative",
            boxSizing: "border-box",
            display: "list-item",
            listStyleType: "none",
          }}
        >
          <MDBox
            color="white"
            bgColor="info"
            variant="gradient"
            borderRadius="lg"
            shadow="lg"
            opacity={1}
            p={2}
          >
            {/* {pod.name} */}
          </MDBox>
        </li>
      ))}
    </ul>
  );
}

Node.defaultProps = {
  pods: [],
};
Node.propTypes = {
  pods: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
};

export default Node;
