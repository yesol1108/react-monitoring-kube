/* eslint-disable consistent-return */
/* eslint-disable no-plusplus */
/* eslint-disable array-callback-return */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/require-default-props */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import PropTypes, { objectOf } from "prop-types";

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

// eslint-disable-next-line no-unused-vars
import { setDarkMode } from "context";

import NodeTemplate from "./components/NodeTemplate";

const apitoken = "Bearer sha256~ue2-_c2lgwSAugB0l16TzDr0bKAnZ2KaPZeT7OozXaY";

const createPod = (pod, podColor, podSvcName) => ({
  key: pod.metadata.uid,
  uid: pod.metadata.uid,
  name: pod.metadata.name,
  namespace: pod.metadata.namespace,
  nodeName: pod.spec.nodeName,
  status: pod.status.phase,
  svcColor: podColor,
  service: podSvcName,
  labels: pod.metadata.labels,
});

const createService = (service, serviceColor) => ({
  uid: service.metadata.uid,
  serviceName: service.metadata.name,
  namespace: service.metadata.namespace,
  svcColor: serviceColor,
  selector: service.spec.selector,
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

function generateRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i += 1) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getServiceColor(obj, value) {
  return Object.keys(obj).find((key) => obj[key] === value);
}

function PodMonitoring() {
  const [loaded, setLoaded] = useState(false);
  const [resourceVersion, setResourceVersion] = useState(null);
  const [allPods, setAllPods] = useState({});
  const podList = Array.from(Object.values(allPods));
  const [serviceList, setAllServices] = useState({});
  const [serviceColorList, setServiceColor] = useState({});

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

        setAllServices(initialServices);
        setLoaded(true);
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
              fetchServices();

              switch (event.type) {
                case "MODIFIED":
                case "ADDED": {
                  if (!podobject.spec.nodeName) {
                    return;
                  }
                  const podName = podobject.metadata.name;

                  const serviceNames = Object.keys(serviceList);
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
                    podColor = serviceList[includeName].svcColor;
                    podSvcName = includeName;
                  }
                  setAllPods((prev) => ({
                    ...prev,
                    [podId]: createPod(podobject, podColor, podSvcName),
                  }));
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

        console.log(serviceItems);
        initialSvcs = serviceItems.reduce((prev, cur) => {
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
        console.log(initialSvcs);
        setAllServices(initialSvcs);
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

        const serviceNames = Object.keys(initialSvcs);
        // console.log(serviceNames);
        // console.log(poditems);
        const initialAllPods = poditems.reduce((prev, cur) => {
          if (!cur.spec.nodeName) {
            return prev;
          }
          const podName = cur.metadata.name;
          const podNamespace = cur.metadata.namespace;

          const podId = `${podNamespace}-${podName}`;

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

          return {
            ...prev,
            [podId]: createPod(cur, podColor, podSvcName),
          };
        }, {});
        console.log(response.items);
        setAllPods(initialAllPods);
        setLoaded(true);
        setResourceVersion(response.metadata.resourceVersion);
      });
  }

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
