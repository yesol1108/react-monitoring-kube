/* eslint-disable no-constant-condition */
/* eslint-disable no-unused-vars */
import React from "react";
import PropTypes from "prop-types";
import hexToRgb from "assets/theme/functions/hexToRgb";
import MDBox from "components/MDBox";
import Box from "@mui/material/Box";

// @mui material components
import Grid from "@mui/material/Grid";
import { Tooltip } from "@mui/material";
import chroma from "chroma-js";

function Node({ pods }) {
  // console.log(pods);
  if (pods.length === 0) {
    return null;
  }
  return (
    <>
      {/* eslint-disable-next-line no-unused-vars */}
      {pods.map((pod) => (
        <Grid item xs={12} sm={3} lg={2}>
          <Tooltip title={`${pod.name}@@@${pod.service}`}>
            <Box
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
        </Grid>
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
