/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// eslint-disable-next-line no-unused-vars
import { setDarkMode } from "context";

import NodeTemplate from "./components/NodeTemplate";

const apitoken = "Bearer sha256~1gVNYTp3WlhtB37yD99Hf9Uo06n3ra0d1VMm0ae54K4";

const createPod = (pod) => ({
  name: pod.metadata.name,
  namespace: pod.metadata.namespace,
  nodeName: pod.spec.nodeName,
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

function PodMonitoring() {
  const [loaded, setLoaded] = useState(false);
  const [resourceVersion, setResourceVersion] = useState(null);
  const [allPods, setAllPods] = useState({});
  const podList = Array.from(Object.values(allPods));

  const podsByNode = groupBy(podList, (it) => it.nodeName);

  const streamUpdates = async (initialLastResourceVersion) => {
    // eslint-disable-next-line prefer-const
    let lastResourceVersion = initialLastResourceVersion;
    if (lastResourceVersion != null) {
      fetch(
        `https://api.ocp49.sandbox1411.opentlc.com:6443/api/v1/pods?watch=1&resourceVersion=${lastResourceVersion}`,
        {
          headers: {
            Authorization: apitoken,
          },
        }
      ).then((response) => {
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
    fetch("https://api.ocp49.sandbox1411.opentlc.com:6443/api/v1/pods", {
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
        <Grid container spacing={3}>
          {/* <ul> */}
          {Object.keys(podsByNode).map((nodeName) => {
            const pods = podsByNode[nodeName];
            return <NodeTemplate nodeName={nodeName} pods={pods} />;
          })}
          {/* </ul> */}
        </Grid>
      </MDBox>
      {/* <Footer /> */}
    </DashboardLayout>
  );
}

export default PodMonitoring;
