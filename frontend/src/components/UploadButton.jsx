import animationData from '../assets/upload-to-success.json';
import { onMount } from 'solid-js';
import lottie from 'lottie-web';

const UploadButton = (props) => {
  let animationContainerRef;
  let animation;

  onMount(() => {
    animation = lottie.loadAnimation({
      container: animationContainerRef, // the dom element that will contain the animation
      animationData,
      loop: false, // set loop to false so the animation only plays once
      autoplay: false, // set autoplay to false so the animation doesn't play automatically
      rendererSettings: {
        scale: 0.5, // set the animation size to 50% of its original size
      },
    });

    animation.addEventListener('complete', () => {
      // add code here to handle what happens after the animation is complete
      console.log('Animation complete!');
      animation.destroy(); // destroy the animation
      animationContainerRef.innerHTML = ''; // clear the animation container
      animation = lottie.loadAnimation({ // reload the animation
        container: animationContainerRef,
        animationData,
        loop: false,
        autoplay: false,
        rendererSettings: {
          scale: 0.5,
        },
      });
      animationContainerRef.style.visibility = 'hidden'; // hide the animation again
    });
  });

  const handleAnimation = () => {
    animation.play(); // play the animation when the button is clicked
    animationContainerRef.style.visibility = 'visible'; // show the animation
    if (props.onClick) {
      props.onClick();
    }
  };

  return (
    <div>
      <button onClick={handleAnimation}>
        Upload File
      </button>
      <div
        style={{
          width: '100px',
          height: '100px',
          visibility: 'hidden', // hide the animation initially
        }}
        ref={el => (animationContainerRef = el)}
      />
    </div>
  );
};

export default UploadButton;