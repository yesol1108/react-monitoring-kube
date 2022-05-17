/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import DataTable from "examples/Tables/DataTable";
import MDBox from "components/MDBox";
import { grid } from "@mui/system";
import MDTypography from "components/MDTypography";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

import Node from "./Node";

function NamespacesList({ pods, namespaceList }) {
  // console.log(namespaceList);
  return (
    <DataTable
      table={{
        columns: [
          { Header: "Name", accessor: "name", width: "18%" },
          { Header: "Status", accessor: "status", width: "11%" },
          // { Header: "Display name", accessor: "displayname", width: "16%" },
          // { Header: "Requester", accessor: "requester", width: "16%" },
          // { Header: "Memory", accessor: "memory", width: "11%" },
          // { Header: "Cpu", accessor: "cpu", width: "11%" },
          { Header: "Created", accessor: "createdAt", width: "17%" },
          { Header: "Pod Count", accessor: "podCount" },
        ],
        rows: namespaceList,
      }}
    />
  );
}

NamespacesList.defaultProps = {
  namespaceList: [],
  pods: [],
};

NamespacesList.propTypes = {
  namespaceList: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
  pods: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
};

export default NamespacesList;
