/* eslint-disable no-constant-condition */
/* eslint-disable no-unused-vars */
import React from "react";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import Box from "@mui/material/Box";

// @mui material components
import { Tooltip } from "@mui/material";

function Node({ pods }) {
  // console.log(pods);
  if (pods.length === 0) {
    return null;
  }
  return (
    <>
      {pods.map((pod) => (
          <Tooltip key={pod.uid} title={`${pod.name}@@@${pod.service}`} >
            <Box
              key={pod.uid}
              sx={{
                width: 35,
                height: 35,
                margin: 1,
                backgroundColor: pod.svcColor,
                "&:hover": {
                  backgroundColor: pod.svcColor - 100,
                  opacity: [0.9, 0.8, 0.7],
                },
              }}
            />
          </Tooltip>
      ))}
    </>
  );
}

Node.defaultProps = {
  pods: [],
};
Node.propTypes = {
  pods: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
};

export default Node;
