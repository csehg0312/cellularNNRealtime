import animationData from '../assets/upload-to-success.json';
import { createSignal, onMount } from 'solid-js';
import lottie from 'lottie-web';

const UploadButton = () => {
  let buttonRef;
  let animationContainerRef;
  let animation;

  const handleAnimation = () => {
    animation = lottie.loadAnimation({
      container: animationContainerRef, // the dom element that will contain the animation
      animationData,
      loop: false, // set loop to false so the animation only plays once
      autoplay: true, // set autoplay to true so the animation plays automatically after loading
      rendererSettings: {
        scale: 0.5, // set the animation size to 50% of its original size
      },
    });

    animation.addEventListener('complete', () => {
      // add code here to handle what happens after the animation is complete
      console.log('Animation complete!');
    });
  };

  return (
    <div>
      <button ref={buttonRef} onClick={handleAnimation}>
        Upload File
      </button>
      <div ref={animationContainerRef} style={{ width: '100px', height: '100px' }} />
    </div>
  );
};

export default UploadButton;