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

function PodMonitoring() {
  const apitoken = "Bearer sha256~catK_DH6M6nvGet49joe77XOTkGn3JOfulZJ_Hg4Mkk";

  const [loading, setLoading] = useState(false);
  const [pods, setPods] = useState(null);
  const [error, setError] = useState(null);
  const [lastResourceVersion, setResourceVersion] = useState(null);
  //   const [podList, setPodList] = useState(null);

  //   const onCreate = (podid) => {
  //     const pod = {
  //       id: podid,
  //       pods,
  //     };
  //     setPodList([...pods, pod]);
  //   };

  const fetchPods = async () => {
    try {
      setError(null);
      setPods(null);
      setLoading(true);
      setResourceVersion(null);

      const response = await axios.get(
        "https://api.ocp49.sandbox1411.opentlc.com:6443/api/v1/pods",
        {
          headers: {
            Authorization: apitoken,
          },
        }
      );
      setResourceVersion(response.data.metadata.resourceVersion);
      setPods(response.data.items);
      //   response.data.items.forEach((apod) => {
      //     // console.log(apod);
      //     const podId = `${apod.metadata.namespace}-${apod.metadata.name}`;
      //     setPods(apod);
      //     onCreate(podId);
      //   });
    } catch (e) {
      setError(e);
    }
    setLoading(false);
  };

  if (lastResourceVersion != null) {
    console.log(lastResourceVersion);
    const podstream = axios.get(
      `https://api.ocp49.sandbox1411.opentlc.com:6443/api/v1/pods?watch=1&resourceVersion=${lastResourceVersion}`,
      {
        headers: {
          Authorization: apitoken,
        },
      }
    );
  }

  useEffect(() => {
    fetchPods();
  }, []);

  if (loading) return <div>로딩중..</div>;
  if (error) return <div>에러가 발생했습니다</div>;

  // 아직 pods목록이 받아와 지지 않았을 때는 아무것도 표시되지 않도록
  if (!pods) return null;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <ul>
        {pods.map((pod) => (
          <li key={pod.metadata.uid}>
            {pod.metadata.name} ({pod.metadata.namespace})
          </li>
        ))}
      </ul>
      <Footer />
    </DashboardLayout>
  );
}

export default PodMonitoring;
