import React from "react";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import { Tooltip } from "@mui/material";

function Node({ pods }) {
  if (pods.length === 0) {
    return null;
  }
  return (
    <ul
      style={{
        display: "flex",
        flexWrap: "wrap",
        boxSizing: "border-box",
        marginRight: "auto",
        marginLeft: "auto",
      }}
    >
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
          <Tooltip title={pod.name}>
            <MDBox
              color="white"
              bgColor="info"
              variant="gradient"
              borderRadius="lg"
              shadow="lg"
              opacity={1}
              p={2}
            />
          </Tooltip>
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
