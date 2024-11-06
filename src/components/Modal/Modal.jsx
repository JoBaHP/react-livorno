import React, { useEffect } from "react";
import "./Modal.css";

const Modal = ({ imageUrl, onClose }) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content animate"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-button" onClick={onClose}></button>
        <div className="modal-header">
          <h2 className="modal-title">
            Da li ste vec probali nasu hrskavu piletinu?
          </h2>
          <p className="modal-description">
            Cena: 790din
            <br />
            Pozovite:{" "}
            <a href="tel:0611970198" className="modal-phone-link">
              061/197-0198
            </a>
          </p>
        </div>
        <div className="modal-divider"></div>
        <div className="modal-image-container">
          <img src={imageUrl} alt="Crispy Chicken" className="modal-image" />
        </div>
      </div>
    </div>
  );
};

export default Modal;
