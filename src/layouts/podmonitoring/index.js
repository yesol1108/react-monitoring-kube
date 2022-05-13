/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
// eslint-disable-next-line no-unused-vars
import { setDarkMode } from "context";

import { useStream } from "react-fetch-streams";

function PodMonitoring() {
  const apitoken = "Bearer sha256~Qy89Sj5CLv7250oCTUIh-vemZDZXzy9AshccGTSsrYU";

  const [loading, setLoading] = useState(false);
  //   const [lastResourceVersion, setResourceVersion] = useState(null);
  const [pods, setPods] = useState(null);
  const [podList, setPodList] = useState(null);
  let lastResourceVersion;

  const onDeleted = (uid) => {
    setPods(pods.filter((pod) => pod.metadata.uid !== uid));
  };

  const onModified = (uid) => {
    setPods(
      pods.map((pod) =>
        pod.metadata.uid === uid
          ? {
              ...pod,
              name: pod.metadata.name,
              namespace: pod.metadata.namespace,
              nodeName: pod.spec.nodeName,
            }
          : pod
      )
    );
  };

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

  const streamUpdates = () => {
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
        console.log(stream);
        return stream.read().then((done, value) => {
          console.log(value);
          if (done) {
            console.log("Request terminated");
            return;
          }
          buffer += utf8Decoder.decode(value);
          buffer = onNewLine(buffer, (chunk) => {
            if (chunk.trim().length === 0) {
              console.log("NO DATA!!!!");
              return;
            }
            try {
              const event = JSON.parse(chunk);
              console.log("PROCESSING EVENT: ", event);
              const { podobject } = event;
              switch (event.type) {
                case "ADDED": {
                  setPods(podobject);
                  break;
                }
                case "DELETED": {
                  console.log(podobject);
                  // onDeleted(podobject.)
                  // app.remove(podId);
                  break;
                }
                case "MODIFIED": {
                  setPods(podobject);
                  break;
                }
                default:
                  break;
              }
            } catch (error) {
              console.log("Error while parsing", chunk, "\n", error);
            }
          });
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
        const poditem = response.items;
        lastResourceVersion = response.metadata.resourceVersion;
        poditem.forEach((pod) => {
          // console.log(pod.metadata);
          setPods(pod);
        });
      })
      .then(() => streamUpdates());
  }

  //   if (lastResourceVersion != null) {
  //     console.log(lastResourceVersion);
  //     const podstream = axios.get(
  //       `https://api.ocp49.sandbox1411.opentlc.com:6443/api/v1/pods?watch=1&resourceVersion=${lastResourceVersion}`,
  //       {
  //         headers: {
  //           Authorization: apitoken,
  //         },
  //       }
  //     );
  //   }

  useEffect(() => {
    fetchPods();
  }, []);

  // 아직 pods목록이 받아와 지지 않았을 때는 아무것도 표시되지 않도록
  //   if (!pods) return null;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      {/* <ul>
        {pods.map((pod) => (
          <li key={pod.metadata.uid}>
            {pod.metadata.name} ({pod.metadata.namespace})
          </li>
        ))}
      </ul> */}
      <Footer />
    </DashboardLayout>
  );
}

export default PodMonitoring;
