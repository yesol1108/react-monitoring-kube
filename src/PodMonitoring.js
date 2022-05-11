import React, { useState, useEffect } from "react";
import axios from "axios";

function PodMonitoring() {
  const apitoken = "Bearer sha256~84tETvkktew2BdOme4_XFNVubL7z8LQ2H1uNjGcn7o0";
  const [pods, setPods] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastResourceVersion, setResourceVersion] = useState(null);

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
    <ul>
      {pods.map((pod) => (
        <li key={pod.metadata.uid}>
          {pod.metadata.name} ({pod.metadata.namespace})
        </li>
      ))}
    </ul>
  );
}

export default PodMonitoring;
