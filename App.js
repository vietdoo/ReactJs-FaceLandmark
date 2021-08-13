import './css/App.css';
import { useRef , useEffect } from 'react';
import * as facemesh from'@tensorflow-models/facemesh';
import * as tf from '@tensorflow/tfjs';
import { drawMesh } from "./drawFace";

function App() {

  const webcam = useRef();
  const canvas = useRef();
  const mobilenetModule = useRef();

  //var ctx = canvas.getContext('2d');
  const init = async () => {
    await setupCamera();
    canvas.current.width = 640;
    canvas.current.height = 360;
    console.log("setup camera done !!");
  }

  const setupCamera = () => {
    return new Promise((resolve, reject) => {
      navigator.getUserMedia = navigator.getUserMedia
      if (navigator.getUserMedia) {
        navigator.getUserMedia(
          {video: true},
          stream => {
            webcam.current.srcObject = stream;
            webcam.current.addEventListener('loadeddata', resolve);
          },
          error => reject(error)
        );
      } else {
        reject();
      }
    });
  };

  const drawPath = (ctx, points, closePath) => {
    const region = new Path2D();
    region.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      region.lineTo(point[0], point[1]);
    }
  
    if (closePath) {
      region.closePath();
    }
    ctx.strokeStyle = "grey";
    ctx.stroke(region);
  };

  var meshF = null;

  const runFaceMesh = async () => {
    const net = await facemesh.load ({
      inputResolution: {width: 640, height:360}
    })
    meshF = setInterval(() => {
      detect(net)
    }, 50)
  }

  const playcam = () => {
    if (typeof webcam.current !== "undefined") {
      const video = webcam.current;
      const ctx = canvas.current.getContext("2d");
      ctx.drawImage(video, 0, 0);
    }
  }

  var playcanvas = setInterval(playcam, 33);

  const detect = async (net) => {
    clearInterval(playcanvas);
    if (typeof webcam.current !== "undefined") {
      const video = webcam.current;
      
      const face = await net.estimateFaces(video);
      console.log(face);
      

      const ctx = canvas.current.getContext("2d");
      ctx.drawImage(video, 0, 0);
      drawMesh(face, ctx);
    }
  }

  const stopProgram = () => {
    clearInterval(meshF);
    canvas.current.width = 640;
    canvas.current.height = 360;
  }

  useEffect (() => {
    init();
    
    return () => {

    }
  }, []);

  return (
    <div className="main">
      Face Landmark by vietdoo
      <video
        ref={webcam}
        className="video"
        autoPlay
      />
      <canvas
        ref={canvas}  
        className="canvas"    
      />
      <div className="control">
         <button className="btn" id = "b1" onClick={() => runFaceMesh()}>Scan</button>
         <button className="btn" id = "b2" onClick={() => stopProgram()}>Stop</button>
      </div>
    </div>
    
    

  );
}

export default App;
