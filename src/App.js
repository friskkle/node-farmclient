import './App.css';
import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js'
import { render } from "react-dom";
import { Line } from 'react-chartjs-2';
import {
  CircularProgressbar,
  CircularProgressbarWithChildren,
  buildStyles
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Progress } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import sunny from './img/sunny.png'
import humidicon from './img/humidity.png'
import lighticon from './img/light.png'

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

ChartJS.defaults.color = "#c9c9c9";

function App() {
  const [percentage, setPercentage] = useState(5);
  const [curTemp, setCurTemp] = useState();
  const [curHumidity, setCurHumidity] = useState();
  const [curLight, setCurLight] = useState();
  const [curTime, setCurTime] = useState();

  const [collectiveTime, setCollectiveTime] = useState([]);
  const [collectiveTemp, setCollectiveTemp] = useState([]);
  const [collectiveHumidity, setCollectiveHumidity] = useState([]);
  const [collectiveLight, setCollectiveLight] = useState([]);

  setInterval(()=>{
    setPercentage(percentage + 3)
  }, 5000)

  useEffect(() => {

    const fetchData = async () => {

      let i = 0

      try {
        /* 192.168.88.16 */
        const response = await fetch('http://10.62.175.235:3001');
        const buffer = await response.arrayBuffer();
        console.log(buffer)

        // Parse the received buffer
        const dataView = new DataView(buffer);

        // Read the length of the data (first 4 bytes)
        const dataLength = dataView.getUint32(0, false);
        console.log(dataLength)

        // Read the data (from 4th byte to dataLength + 4 bytes)
        const data = new TextDecoder().decode(
          new Uint8Array(buffer, 4, dataLength)
        );

        // Read the checksum (last 4 bytes)
        const checksum = dataView.getUint32(dataLength + 4, false);

        // Validate checksum here if needed

        // Update state with the received data
        const parsedData = JSON.parse(data);

        const times = [];
        const tempVals = [];
        const humidityVals = [];
        const lightVals = [];

        parsedData.temperature.forEach((item) => {
          let itemInfo = item.split(" ")
          let ts = itemInfo[0] + " " + itemInfo[1]
          times.push(ts)
          tempVals.push(itemInfo[2])
        })

        parsedData.humidity.forEach((item) => {
          let itemInfo = item.split(" ")
          humidityVals.push(itemInfo[2])
        })

        parsedData.light.forEach((item) => {
          let itemInfo = item.split(" ")
          lightVals.push(itemInfo[2])
        })

        const accTemp = []
        const accHum = []
        const accLight = []
        const accTime = []

        for(let i = 0; i < 5; i++){
          accTemp.push(tempVals[i])
          setCollectiveTemp(accTemp)
          
          accHum.push(humidityVals[i])
          setCollectiveHumidity(accHum)
          
          accLight.push(lightVals[i])
          setCollectiveLight(accLight)

          accTime.push(times[i])
          setCollectiveTime(accTime)

          setCurTemp(tempVals[i])
          setCurHumidity(humidityVals[i])
          setCurLight(lightVals[i])
          setCurTime(times[i])
        }

        console.log('Data loaded!')

        setInterval(async ()=>{
          console.log('Data updated.')
          setCurTime(times[i])
          accTime.push(times[i])
          setCollectiveTime(accTime)

          setCurTemp(tempVals[i])
          accTemp.push(tempVals[i])
          setCollectiveTemp(accTemp)

          setCurHumidity(humidityVals[i])
          accHum.push(humidityVals[i])
          setCollectiveHumidity(accHum)

          setCurLight(lightVals[i])
          accLight.push(lightVals[i++])
          setCollectiveLight(accLight)

          i = i % tempVals.length
        }, 5000)

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

const data = {
  labels: collectiveTime,
  datasets: [
    {
      label: 'Temperature',
      data: collectiveTemp,
      backgroundColor: '#1a2e70',
      borderColor: 'aqua',
      tension: 0.5
    },
    {
      label: 'Humidity',
      data: collectiveHumidity,
      backgroundColor: '#0f3312',
      borderColor: 'green',
      tension: 0.4
    },
    {
      label: 'Light',
      data: collectiveLight,
      backgroundColor: '#6b0000',
      borderColor: 'red',
      tension: 0.4
    }
  ]
};

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 2000,
        grid: {
          color: "#c9c9c9"
        }
      },
      x: {
        grid: {
          color: "#c9c9c9"
        }
      }
    }
  }

  return (
    <div className="App"/*  style={{backgroundImage: `url(${bg})`}} */>
      <header className="App-header">
          Hello, here's how your farm is doing
      </header>
      <div className='boxes' style={{justifyContent: 'center'}}>
        <div className='box' style={{minHeight: '10vh', padding: '25px', gap: '10px', minWidth: '25vw'}}>
          <div className='body-flex'>{curTime}</div>
          <div className='flex-column start-align'>
            <div className='body-flex' style={{fontSize: 'calc(1.475rem + 2.7vw'}}>{curTemp}°F</div>
            <div>Sunny</div>
          </div>
          <div className='flex-row' style={{justifyContent: 'space-between', marginTop: '10%'}}>
            <div className='flex-column start-align' style={{alignContent: 'flex-start', gap: '5px'}}>
              <div className='flex-row' style={{alignItems: 'center', fontSize: '12px'}}>
                <img src={humidicon} style={{width: '30px', height: '30px'}}/>
                {curHumidity}g/m3
              </div>
              <div className='flex-row' style={{alignItems: 'center', fontSize: '12px'}}>
                <img src={lighticon} style={{width: '30px', height: '30px'}}/>
                {curLight}lum
              </div>
            </div>
            <div>
              <img src={sunny} style={{maxWidth: '100px', maxHeight: '100px'}}/>
            </div>
          </div>
        </div>
        <div className='flex-column' style={{justifyContent: 'space-between', gap: '5px'}}>
          <div className='box flex-row' style={{padding: '20px', justifyContent: 'space-evenly', fontSize: 'calc(1.1rem'}}>
            <div style={{maxWidth: "35%"}}>
              <CircularProgressbar
                value={percentage}
                maxValue={100}
                text={`${percentage}%`}
                background
                backgroundPadding={6}
                styles={buildStyles({
                  backgroundColor: "#3e98c7",
                  textColor: "#fff",
                  pathColor: "#fff",
                  trailColor: "transparent"
                })}
              />
            </div>
            <h4 style={{alignSelf: 'center'}}>Estimated Crops Progress</h4>
          </div>
          <div className='box flex-row' style={{padding: '20px'}}>
            <h4>Energy usage</h4>
            <Progress.Line percent={Math.floor(curLight/4)} vertical={false}/>
          </div>
        </div>
      </div>
      <div className='boxes' style={{minHeight: '450px'}}>
        <div className='box' style={{width: '100%', padding: '15px'}}>
          <Line
            data = {data}
            options = {options}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
