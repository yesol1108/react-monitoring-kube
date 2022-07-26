/* eslint-disable array-callback-return */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/require-default-props */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import PropTypes, { objectOf } from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// eslint-disable-next-line no-unused-vars
import { setDarkMode } from "context";

import NodeTemplate from "./components/NodeTemplate";

<<<<<<< HEAD
const apitoken = "Bearer sha256~CCMIkBOJJDIVOrl39O7fa4-TeXUmUIYWBGFVAPKCHgI";
=======
const apitoken = "Bearer sha256~GS5LHfJZhpnDSqO6dG1h5sogy9x7YbTMTYEoMf54Oy0";
>>>>>>> parent of 002afa6 (box 마다 색깔 다르게 출력은 되는데 service를 pod name으로 자르는게 좀....)

const createPod = (pod) => ({
  key: pod.metadata.uid,
  uid: pod.metadata.uid,
  name: pod.metadata.name,
  namespace: pod.metadata.namespace,
  nodeName: pod.spec.nodeName,
  status: pod.status.phase,
});

const createService = (service, serviceColor) => ({
  uid: service.metadata.uid,
  serviceName: service.metadata.name,
  namespace: service.metadata.namespace,
  svcColor: serviceColor,
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

<<<<<<< HEAD
function generateRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

=======
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

>>>>>>> parent of 002afa6 (box 마다 색깔 다르게 출력은 되는데 service를 pod name으로 자르는게 좀....)
function PodMonitoring() {
  const [loaded, setLoaded] = useState(false);
  const [resourceVersion, setResourceVersion] = useState(null);
  const [allPods, setAllPods] = useState({});
  const [serviceList, setAllServices] = useState({});
  const [serviceColorList, setServiceColor] = useState({});

  const podList = Array.from(Object.values(allPods));
  const serviceInitialList = Array.from(Object.values(serviceList));

  const podsByNode = groupBy(podList, (it) => it.nodeName);
  const podsByServices = groupBy(podList, (it) => it.generateName);

  const fetchServices = () => {
    fetch("/api/v1/services", {
      headers: {
        Authorization: apitoken,
        "Access-Control-Allow-origin": "*",
        "Access-Control-Allow-Credentials": "true",
      },
    })
      .then((response) => response.json())
      .then((response) => {
        // console.log(response.items);
        const serviceItems = response.items;
        const initialServices = serviceItems.reduce((prev, cur) => {
          if (!cur.metadata.name) {
            return prev;
          }
          const serviceName = `${cur.metadata.name}`;
          const serviceColor = Math.floor(Math.random() * 16777215).toString(16);
          return {
            ...prev,
            [serviceName]: createService(cur, serviceColor),
          };
        }, {});
<<<<<<< HEAD
=======
        // console.log(initialServices);
>>>>>>> parent of 002afa6 (box 마다 색깔 다르게 출력은 되는데 service를 pod name으로 자르는게 좀....)
        setAllServices(initialServices);
      });
  };

  const streamUpdates = async (initialLastResourceVersion) => {
    let lastResourceVersion = initialLastResourceVersion;
    if (lastResourceVersion != null) {
      fetch(`/api/v1/pods?watch=1&resourceVersion=${lastResourceVersion}`, {
        headers: {
          Authorization: apitoken,
          "Access-Control-Allow-origin": "*",
          "Access-Control-Allow-Credentials": "true",
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
              console.log("PROCESSING POD EVENT: ", event);
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
              fetchServices();
              lastResourceVersion = event.object.metadata.resourceVersion;
            } catch (error) {
              console.log("Error while parsing", chunk, "\n", error);
            }
          });
          return stream.read().then(processText);
        });
      });
    }
  };

  function fetchPods() {

    let initialSvcs = "";

    // get services
    fetch("/api/v1/services", {
      headers: {
        Authorization: apitoken,
        "Access-Control-Allow-origin": "*",
        "Access-Control-Allow-Credentials": "true",
      },
    })
      .then((response) => response.json())
      .then((response) => {
        const serviceItems = response.items;
        initialSvcs = serviceItems.reduce((prev, cur) => {
          if (!cur.metadata.name) {
            return prev;
          }
          const serviceName = `${cur.metadata.name}`;
          const serviceColor = Math.floor(Math.random() * 16777215).toString(16);
          return {
            ...prev,
            [serviceName]: createService(cur, serviceColor),
          };
        }, {});
        setAllServices(initialSvcs);
      });

    fetch("/api/v1/services", {
      headers: {
        Authorization: apitoken,
        "Access-Control-Allow-origin": "*",
        "Access-Control-Allow-Credentials": "true",
      },
    })
      .then((response) => response.json())
      .then((response) => {
        const serviceItems = response.items;
        const initialServices = serviceItems.reduce((prev, cur) => {
          if (!cur.metadata.name) {
            return prev;
          }
          const serviceName = `${cur.metadata.name}`;
          const serviceColor = generateRandomColor();
          return {
            ...prev,
            [serviceName]: createService(cur, serviceColor),
          };
        }, {});
        console.log(initialServices);
        setAllServices(initialServices);
      });

    fetch("/api/v1/pods", {
      headers: {
        Authorization: apitoken,
        "Access-Control-Allow-origin": "*",
        "Access-Control-Allow-Credentials": "true",
      },
    })
      .then((response) => response.json())
      .then((response) => {
        const poditems = response.items;

<<<<<<< HEAD
        const serviceNames = Object.keys(serviceList);

        // console.log(poditems);
=======
        const serviceNames = Object.keys(initialSvcs);
        console.log(serviceNames);

        console.log(poditems);
        // eslint-disable-next-line consistent-return
>>>>>>> parent of 002afa6 (box 마다 색깔 다르게 출력은 되는데 service를 pod name으로 자르는게 좀....)
        const initialAllPods = poditems.reduce((prev, cur) => {
          if (!cur.spec.nodeName) {
            return prev;
          }
          const podName = cur.metadata.name;
          const podId = `${cur.metadata.namespace}-${podName}`;
<<<<<<< HEAD
          let includeName = "";
          serviceNames.forEach((i) => {
            if (podName.includes(i)) {
              includeName = i;
            }
            return includeName;
          });

          let podColor = "#c1e6ff";
          let podSvcName = "";

          if (includeName === "" || includeName === "null") {
            podColor = "#c1e6ff";
          } else {
            podColor = initialSvcs[includeName].svcColor;
            podSvcName = includeName;
          }

=======
>>>>>>> parent of 002afa6 (box 마다 색깔 다르게 출력은 되는데 service를 pod name으로 자르는게 좀....)
          return {
            ...prev,
            [podId]: createPod(cur),
          };
        }, {});
<<<<<<< HEAD
        
=======
        // console.log(response.items);
>>>>>>> parent of 002afa6 (box 마다 색깔 다르게 출력은 되는데 service를 pod name으로 자르는게 좀....)
        setAllPods(initialAllPods);
        setLoaded(true);
        setResourceVersion(response.metadata.resourceVersion);
      });
  }

  useEffect(() => {
    fetchServices();
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
      <MDBox py={3}>
        <Grid container spacing={1.5}>
          {Object.keys(podsByNode).map((nodeName) => {
            const pods = podsByNode[nodeName];
            return <NodeTemplate key={nodeName} nodeName={nodeName} pods={pods} />;
          })}
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default PodMonitoring;
