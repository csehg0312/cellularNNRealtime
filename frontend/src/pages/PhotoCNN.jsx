import { createSignal } from "solid-js";
import UploadButton from "../components/UploadButton";

function isLocalhost() {
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
}

function PhotoCNN() {
  const [image, setImage] = createSignal(null);
  const [outputImage, setOutputImage] = createSignal(null);
  const [loading, setLoading] = createSignal(false);
  const [serverUrl, setServerUrl] = createSignal(isLocalhost() ? "http://localhost:8000/upload" : "http://172.18.94.227:8000/upload");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!image()) return;
    console.log("Starting upload");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", image());

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
    <div>
      <input type="file" accept="image/*" capture="user" onChange={handleImageChange} />
      {image() && (
        <div>
          <img src={image()} alt="Captured" style={{ maxWidth: "300px" }} />
          <UploadButton onClick={uploadImage} />
        </div>
      )}
      {outputImage() && (
        <div>
          <h3>Output Image:</h3>
          <img src={outputImage()} alt="Processed" style={{ maxWidth: "300px" }} />
        </div>
      )}
    </div>
  );
}

export default PhotoCNN;