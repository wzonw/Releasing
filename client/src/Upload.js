import React from 'react';
import Header from './Header';
import './Upload.css';

function Upload() {
  return (
    <div className="bodyup">
      <Header />
      <div className="bodymain">
        <div className="upload-box">
          <div className="upload-left">
            <h3>Upload Here</h3>
            <p className="subtext">
              Upload an excel file (.xlsx) for list of names that are ready for releasing here
            </p>

            <h4>File Preview:</h4>
            <div className="dropzone">
              <p className="drop-text">Upload an Excel File</p>
              <label htmlFor="file-upload" className="upload-btn">
                <span className="icon">⬆</span> BROWSE
              </label>
              <input type="file" id="file-upload" accept=".xlsx" hidden />
              <div className="filesize-note">max 50 MB</div>
            </div>
          </div>

          <div className="upload-right">
            <p className="instruction">
              All names on the files uploaded will be converted and replaced with a ‘Releasing’
              status. Please make sure of the names in the files before uploading.
            </p>
            <div className="file-list">
              <p><strong>Uploaded Files:</strong></p>
              <div className="uploaded-file">File_Name.xlsx <button className="remove-btn">🗑</button></div>
              <div className="uploaded-file">File_Name.xlsx <button className="remove-btn">🗑</button></div>
              <div className="uploaded-file">File_Name.xlsx <button className="remove-btn">🗑</button></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Upload;
