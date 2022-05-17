/* eslint-disable no-constant-condition */
/* eslint-disable no-unused-vars */
import React from "react";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";

// @mui material components
import Grid from "@mui/material/Grid";
import { Tooltip } from "@mui/material";

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
          <Tooltip title={pod.name}>
            <MDBox
              key={pod.name}
              bgColor={pod.status === "Running" || "Succeeded" ? "success" : "error"}
              variant="gradient"
              borderRadius="lg"
              shadow="lg"
              width={35}
              opacity={1}
              p={2.5}
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
