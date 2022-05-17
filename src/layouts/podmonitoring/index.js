/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/require-default-props */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// eslint-disable-next-line no-unused-vars
import { setDarkMode } from "context";

import NodeTemplate from "./components/NodeTemplate";
import NamespacesList from "./components/NamespacesList";

const apitoken = "Bearer sha256~Pg0q-Ga8JbrucobAvIQFlFMD-dFb1eHoenmFC6RV0pw";

const createPod = (pod) => ({
  key: pod.metadata.uid,
  uid: pod.metadata.uid,
  name: pod.metadata.name,
  namespace: pod.metadata.namespace,
  nodeName: pod.spec.nodeName,
  status: pod.status.phase,
});

const createNamepsace = (namespaces) => ({
  // { Header: "Display name", accessor: "displayname", width: "16%" },
  // { Header: "Requester", accessor: "requester", width: "16%" },
  // { Header: "Memory", accessor: "memory", width: "11%" },
  // { Header: "Cpu", accessor: "cpu", width: "11%" },
  name: namespaces.metadata.name,
  status: namespaces.status.phase,
  createdAt: namespaces.metadata.creationTimestamp,
});

const onNewLine = (buffer, fn) => {
  const newLineIndex = buffer.indexOf("\n");
  if (newLineIndex === -1) {
    return buffer;
  }
  const chunk = buffer.slice(0, buffer.indexOf("\n"));
  const newBuffer = buffer.slice(buffer.indexOf("\n") + 1);
  fn(chunk);
  return onNewLine(newBuffer, fn);
};

function groupBy(arr, groupByKeyFn) {
  return arr.reduce((acc, c) => {
    const key = groupByKeyFn(c);
    if (!(key in acc)) {
      acc[key] = [];
    }
    acc[key].push(c);
    return acc;
  }, {});
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function PodMonitoring() {
  const [loaded, setLoaded] = useState(false);
  const [resourceVersion, setResourceVersion] = useState(null);
  const [allPods, setAllPods] = useState({});
  const podList = Array.from(Object.values(allPods));
  const [tabval, setTabVal] = useState(0);
  const [namespaceList, setAllNamespaces] = useState({});

  const podsByNode = groupBy(podList, (it) => it.nodeName);

  const streamUpdates = async (initialLastResourceVersion) => {
    // eslint-disable-next-line prefer-const
    let lastResourceVersion = initialLastResourceVersion;
    if (lastResourceVersion != null) {
      fetch(`/api/v1/pods?watch=1&resourceVersion=${lastResourceVersion}`, {
        headers: {
          Authorization: apitoken,
        },
      }).then((response) => {
        const stream = response.body.getReader();
        const utf8Decoder = new TextDecoder("utf-8");
        let buffer = "";
        return stream.read().then(function processText({ done, value }) {
          if (done) {
            console.log("Request terminated");
            return;
          }
          buffer += utf8Decoder.decode(value);
          buffer = onNewLine(buffer, (chunk) => {
            if (chunk.trim().length === 0) {
              return;
            }
            try {
              const event = JSON.parse(chunk);
              console.log("PROCESSING EVENT: ", event);
              const { object: podobject } = event;
              const podId = `${podobject.metadata.namespace}-${podobject.metadata.name}`;
              switch (event.type) {
                case "MODIFIED":
                case "ADDED": {
                  if (!podobject.spec.nodeName) {
                    return;
                  }
                  // console.log(podobject);
                  setAllPods((prev) => ({ ...prev, [podId]: createPod(podobject) }));
                  break;
                }
                case "DELETED": {
                  setAllPods((prev) => {
                    const newPods = { ...prev };
                    delete newPods[podId];
                    return newPods;
                  });
                  break;
                }
                default:
                  break;
              }
              lastResourceVersion = event.object.metadata.resourceVersion;
            } catch (error) {
              console.log("Error while parsing", chunk, "\n", error);
            }
          });
          // eslint-disable-next-line consistent-return
          return stream.read().then(processText);
        });
      });
    }
  };

  function fetchPods() {
    fetch("/api/v1/pods", {
      headers: {
        Authorization: apitoken,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        const poditems = response.items;
        const initialAllPods = poditems.reduce((prev, cur) => {
          if (!cur.spec.nodeName) {
            return prev;
          }
          const podId = `${cur.metadata.namespace}-${cur.metadata.name}`;
          return {
            ...prev,
            [podId]: createPod(cur),
          };
        }, {});
        setAllPods(initialAllPods);
        setLoaded(true);
        setResourceVersion(response.metadata.resourceVersion);
      });
  }

  function fetchNamespaces() {
    fetch("/api/v1/namespaces", {
      headers: {
        Authorization: apitoken,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        const namespaceitems = response.items;
        const initalNamespaces = namespaceitems.reduce((prev, cur) => {
          const namespaceUid = cur.metadata.uid;
          console.log(`###{${prev}`);
          return {
            ...prev,
            name: cur.metadata.name,
            status: cur.status.phase,
            createdAt: cur.metadata.creationTimestamp,
          };
        }, {});
        console.log(initalNamespaces);
        setAllNamespaces((prev) => ({ ...prev, initalNamespaces }));
        console.log(namespaceList);
      });
  }

  function fetchServices() {
    fetch("/api/v1/services", {
      headers: {
        Authorization: apitoken,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        console.log(response.items);
        const services = response.items;
      });
  }

  const handleChange = (event, newValue) => {
    console.log(newValue);
    if (newValue === 1) fetchNamespaces();
    else if (newValue === 2) fetchServices();
    setTabVal(newValue);
  };

  useEffect(() => {
    fetchPods();
  }, []);

  useEffect(() => {
    if (!loaded || !resourceVersion) {
      return;
    }
    streamUpdates(resourceVersion);
  }, [loaded, resourceVersion]);
  if (podList.length === 0) {
    return null;
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Tabs value={tabval} onChange={handleChange} aria-label="basic tabs example">
        <Tab label="노드" {...a11yProps(0)} />
        <Tab label="네임스페이스" {...a11yProps(1)} />
        <Tab label="서비스" {...a11yProps(2)} />
      </Tabs>
      <TabPanel value={tabval} index={0}>
        <MDBox py={3}>
          <Grid container spacing={1.5}>
            {Object.keys(podsByNode).map((nodeName) => {
              const pods = podsByNode[nodeName];
              return <NodeTemplate nodeName={nodeName} pods={pods} />;
            })}
          </Grid>
        </MDBox>
      </TabPanel>
      <TabPanel value={tabval} index={1}>
        Namepsace
        <NamespacesList namespaceList={namespaceList} />
      </TabPanel>
      <TabPanel value={tabval} index={2}>
        Service
      </TabPanel>
      {/* <Footer /> */}
    </DashboardLayout>
  );
}

export default PodMonitoring;
