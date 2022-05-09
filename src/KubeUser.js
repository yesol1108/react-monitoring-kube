import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PodMonitoring() {
  const [pods, setPods] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  
  const fetchPods = async () => {
    try {
      setError(null);
      setPods(null);
      setLoading(true);

      const response = await axios.get(
        'https://api.ocp49.sandbox1231.opentlc.com:6443/api/v1/pods', {
          headers: {
            "Authorization": 'Bearer sha256~EvZCvQt2U6sutR-PIXb6X10h_tc-xZOC0NAbakhxnnM'
          }
        }
      );

      console.log(response.data);
      setPods(response.data);
    } catch (e) {
      setError(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPods();
  }, []);

  if (loading) return <div>로딩중..</div>; 
  if (error) return <div>에러가 발생했습니다</div>;

  // 아직 pods목록이 받아와 지지 않았을 때는 아무것도 표시되지 않도록
  if (!pods) return null;

  return (
    <ul>
      {pods.items.map(pod => (
        <li key={pod.metadata.uid}>
          {pod.metadata.name} ({pod.metadata.namespace})
        </li>
      ))}
    </ul>
  );

}

export default PodMonitoring;  