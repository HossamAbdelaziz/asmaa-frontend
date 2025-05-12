// src/components/AvatarCropModal.js
import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "./cropUtils";
import "../styles/AvatarCropModal.css"; // We'll style it after

const AvatarCropModal = ({ image, onClose, onCropComplete }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropAreaComplete = useCallback((_, areaPixels) => {
        setCroppedAreaPixels(areaPixels);
    }, []);

    const handleCrop = async () => {
        const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels);
        onCropComplete(croppedImageBlob);
    };

    return (
        <div className="crop-modal-backdrop">
            <div className="crop-modal">
                <div className="crop-container">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropAreaComplete}
                    />
                </div>
                <div className="crop-controls">
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(e.target.value)}
                    />
                    <button onClick={handleCrop} className="btn btn-success">Save</button>
                    <button onClick={onClose} className="btn btn-outline-secondary">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default AvatarCropModal;
