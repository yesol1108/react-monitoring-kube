/* eslint-disable no-unused-vars */
import React from "react";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import { grid } from "@mui/system";
import MDTypography from "components/MDTypography";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

import Node from "./Node";

function NodeTemplate({ pods, nodeName, color }) {
  return (
    <Grid item xs={12} md={6} lg={4}>
      <MDBox mb={1} pt={1}>
        <Card>
          <MDBox
            textAlign="center"
            lineHeight={1.25}
            justifyContent="center"
            alignItems="center"
            display="flex"
            color={color === "light" ? "dark" : "white"}
          >
            <MDTypography variant="body2" color="text" mt={1.5} mx={1.5} mb={-0.5}>
              {nodeName}
            </MDTypography>
          </MDBox>
          <Divider />
          <MDBox key={nodeName} p={0.5} mt={-1.5} mb={1} ml={2}>
            <Grid container alignItems="center">
              <Node key={nodeName} pods={pods} />
            </Grid>
          </MDBox>
        </Card>
      </MDBox>
    </Grid>
  );
}

NodeTemplate.defaultProps = {
  nodeName: "",
  pods: [],
  color: "info",
};

NodeTemplate.propTypes = {
  nodeName: PropTypes.string,
  pods: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
};

export default NodeTemplate;
