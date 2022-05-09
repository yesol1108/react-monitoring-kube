import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiurl = 'https://api.ocp49.sandbox1231.opentlc.com:6443';
const apitoken = 'Bearer sha256~SwyOFZrGGhY8BYRuTUC8YAA2CSOcn0NZVyLTVaF7enQ';

function PodApiCall() {

  const [pods, setPods] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastResourceVersion, setResourceVersion] = useState(null);
  const [podId, setPodId] = useState(null);
  
  const fetchPods = async () => {
    try {
      setError(null);
      setPods(null);
      setPodId(null),
      setLoading(true);
      setResourceVersion(null);

      const response = await axios.get(
        'https://api.ocp49.sandbox1231.opentlc.com:6443/api/v1/pods', {
          headers: {
            "Authorization": 'Bearer sha256~SwyOFZrGGhY8BYRuTUC8YAA2CSOcn0NZVyLTVaF7enQ'
          }
        }
      );

      setResourceVersion(response.data.metadata.resourceVersion);
      setPods(response.data.items);
      pods.forEach((pod) => {
        let podIdtmp = `${pod.metadata.namespace}-${pod.metadata.name}`
        setPodId(podIdtmp);
      });
    } catch (e) {
      setError(e);
    }
    setLoading(false);
  };

  if(lastResourceVersion != null){
    console.log(lastResourceVersion);
    const podstream = axios.get(
      'https://api.ocp49.sandbox1231.opentlc.com:6443/api/v1/pods?watch=1&resourceVersion='+lastResourceVersion, {
        headers: {
          "Authorization": 'Bearer sha256~SwyOFZrGGhY8BYRuTUC8YAA2CSOcn0NZVyLTVaF7enQ'
        }
      }
    ).then(response => {

    });
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
      {pods.map(pod => (
        <li key={pod.metadata.uid}>
          {pod.metadata.name} ({pod.metadata.namespace})
        </li>
      ))}
    </ul>
  );

}

export default PodApiCall;  