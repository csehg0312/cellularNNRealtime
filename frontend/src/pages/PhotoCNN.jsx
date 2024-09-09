import { createSignal } from "solid-js";
import UploadButton from "../components/UploadButton";
import "./PhotoCNN.module.css"; // New CSS file for responsiveness

function isLocalhost() {
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
}

function PhotoCNN() {
  const [image, setImage] = createSignal(null);
  const [outputImage, setOutputImage] = createSignal(null);
  const [loading, setLoading] = createSignal(false);
  const [serverUrl, setServerUrl] = createSignal(isLocalhost() ? "http://localhost:8000/upload" : "http://172.18.94.227:8000/upload");
  const [selectedSize, setSelectedSize] = createSignal("320x240"); // default size
  const [invertSize, setInvertSize] = createSignal(false);
  const [KeepOriginalSize, setKeepOriginalSize] = createSignal(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSizeChange = (e) => {
    setSelectedSize(e.target.value);
  };

  const handleInvertSizeChange = (e) => {
    setInvertSize(e.target.checked);
    setKeepOriginalSize(e.target.unchecked);
  };

  const handleKeepOriginalSize = (e) => {
    setKeepOriginalSize(e.target.checked);
    setInvertSize(e.target.unchecked);
  };

  const uploadImage = async () => {
    if (!image()) return;
    console.log("Starting upload");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", image());
    formData.append("keep_original_size", KeepOriginalSize());
    formData.append("size", selectedSize());
    formData.append("invert_size", invertSize());

    try {
      const response = await fetch(serverUrl(), {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("Ready to receive");
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setOutputImage(url);
      } else {
        console.error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="photo-cnn-container">
      <div class="upload-container">
        <input type="file" accept="image/*" capture="user" onChange={handleImageChange} />
        {image() && (
          <div class="image-preview">
            <img src={image()} alt="Captured" />
            <UploadButton onClick={uploadImage} />
          </div>
        )}
        {outputImage() && (
          <div class="output-preview">
            <h3>Output Image:</h3>
            <img src={outputImage()} alt="Processed" />
          </div>
        )}
      </div>

      <div class="settings-container">
        <h3>Mode:</h3>
        <select name="settings" id="settings">
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
          <option value="option3">Option 3</option>
        </select>

        <div class="image-size-options">
          <h4>Image size to use:</h4>
          <select value={selectedSize()} onChange={handleSizeChange}>
            <option value="320x240">320x240</option>
            <option value="640x480">640x480</option>
            <option value="960x540">960x540</option>
            <option value="1280x720">1280x720</option>
          </select>
          <label htmlFor="invert_size">
            Invert the size?
            <input type="checkbox" id="invert_size" checked={invertSize()} onChange={handleInvertSizeChange} />
          </label>
          <label htmlFor="keep_original_size">
            Keep original size?
            <input type="checkbox" id="keep_original_size" checked={KeepOriginalSize()} onChange={handleKeepOriginalSize} />
          </label>
        </div>

        <div class="additional-options">
          <h4>Option 3:</h4>
          <select>
            <option value="optionX">Option X</option>
            <option value="optionY">Option Y</option>
            <option value="optionZ">Option Z</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default PhotoCNN;
