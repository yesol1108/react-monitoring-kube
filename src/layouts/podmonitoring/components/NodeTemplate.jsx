/* eslint-disable no-unused-vars */
import React from "react";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

import Node from "./Node";

function NodeTemplate({ pods, nodeName }) {
  return (
    <Grid item xs={12} md={6} lg={3}>
      <MDBox mb={1.5}>
        <MDBox display="flex" justifyContent="space-between" pt={1} px={2}>
          <Card>
            <MDBox textAlign="center" lineHeight={1.25}>
              <MDTypography variant="button" color="text">
                {nodeName}
              </MDTypography>
            </MDBox>
            <Divider />
            <MDBox pb={2} px={2}>
              <Node pods={pods} />
            </MDBox>
          </Card>
        </MDBox>
        {/* <li>
      <div>
        <p>{nodeName}</p>
        <div>
          <Node pods={pods} />
        </div>
      </div>
      </li> */}
      </MDBox>
    </Grid>
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
