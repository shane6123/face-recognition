import React, { useEffect, useState } from 'react';
import {bufferToImage  , createCanvasFromMedia, detectAllFaces , nets  , fetchImage , detectSingleFace , LabeledFaceDescriptors, euclideanDistance } from 'face-api.js';
import canvas from 'canvas';


const MODELS_URL = '/models';







function FaceDetection() {
  const [imageUrl, setImageUrl] = useState('');
  const [faceHashes, setFaceHashes] = useState([]);

  
  useEffect(() => {
    async function loadModels() {
        await nets.ssdMobilenetv1.loadFromUri(MODELS_URL);
        await nets.faceLandmark68Net.loadFromUri(MODELS_URL);
        await nets.faceRecognitionNet.loadFromUri(MODELS_URL);
    }
    loadModels();
    }, []);


  async function handleFileUpload(event) {
    const file = event.target.files[0];
    // console.log(file);

    // Read uploaded image into a canvas
    const img = await bufferToImage(file);
    // console.log(img);
    const canvas = createCanvasFromMedia(img);
    // console.log(canvas);
    // const ctx = canvas.getContext('2d');
    // console.log(ctx);
    // ctx.drawImage(img, 0, 0);

    // Detect faces in the image
    const detections =  await detectAllFaces(canvas).withFaceLandmarks().withFaceDescriptors();
    console.log(detections);
    let testimg = await fetchImage(`https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/Captain%20America/2.jpg`)
    console.log(testimg);
    // console.log(`img: `, img)
    let d = await detectSingleFace(testimg).withFaceLandmarks().withFaceDescriptor()
    detections.forEach(detection => {
       const distances = euclideanDistance( detection.descriptor, d.descriptor);
         console.log(distances);
         if (distances < 0.6) {
           console.log("match");
         } else {
              console.log("no match");
            }
    })
    // detections.map(detection => {
    //     console.log("loop",detection.descriptor);
    //     console.log("single",d.descriptor);
    //     console.log("test" , d.descriptor==detection.descriptor);
    //     //  let face = JSON.stringify(detection.descriptor)

    //      console.log(detection.descriptor);
        

    //     // setFaceHashes([...faceHashes , face]);
    // })
    // setFaceHashes([...faceHashes , detections.descriptor]);
    // console.log("faceHashes", faceHashes);
    


     
    console.log(detections);

    // Generate a hash of each face descriptor
    // const faceHashes = detections.map(d => {
    //   const descriptorString = JSON.stringify(Array.from(d.descriptor));
    //   return hashString(descriptorString);
    // });

    // setImageUrl(canvas.toDataURL());
    // setFaceHashes(faceHashes);
  }

  
function loadLabeledImages() {
    const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark']
    return Promise.all(
      labels.map(async label => {
        const descriptions = []
        for (let i = 1; i <= 2; i++) {
          const img = await fetchImage(`https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/${label}/${i}.jpg`)
          // console.log(`img: `, img)
          const detections = await detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
  
       
          descriptions.push(detections.descriptor)
        }
  
        return new LabeledFaceDescriptors(label, descriptions)
      })
    )
  }
  function hashString(str) {
    const hash = new Uint8Array(32);
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
      .then((h) => hash.set(new Uint8Array(h)))
      .catch(console.error);
    return Buffer.from(hash).toString('hex');
  }

  return (
    <div>
      <input type="file" onChange={handleFileUpload} />
      {/* {imageUrl && <img src={imageUrl} />}
      {faceHashes && (
        <ul>
          {faceHashes.map(hash => <li>{hash}</li>)}
        </ul>
      )} */}
    </div>
  );
}

export default FaceDetection;