import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Header from './Header';
import './Upload.css';

function Upload() {
  const [excelData, setExcelData] = useState({});
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);


  useEffect(() => {
    fetch('http://localhost:3001/files')
      .then(res => res.json())
      .then(data => setUploadedFiles(data))
      .catch(err => console.error('Failed to load files:', err));
  }, []);

  const handleDeleteConfirmed = () => {
    const fileName = fileToDelete.split('/').pop();

    fetch(`http://localhost:3001/uploads/${fileName}`, {method: 'DELETE'})
      .then((res) => {
        if (!res.ok) throw new Error('Delete failed');
        return res.json();
      })
      .then(() => {
        setUploadedFiles((prev) => prev.filter((f) => f !== fileToDelete));
        setFileToDelete(null);
        alert('File Successfully Deleted');
        setShowConfirm(false);
      })
      .catch((err) => {
        console.error('Fetch Error:', err);
        alert('Failed to delete file on the server.');
        setShowConfirm(false);
      });
  };

  const handleCancelDelete = () => {
    setFileToDelete(null);
    setShowConfirm(false);
  };

  const confirmDelete = (filePath) => {
    setFileToDelete(filePath);
    setShowConfirm(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      alert("Please upload a valid .xlsx file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log(result);

      // Read and preview content
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetData = {};
      const sheets = workbook.SheetNames;

      sheets.forEach(sheet => {
        const worksheet = workbook.Sheets[sheet];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        sheetData[sheet] = jsonData;
      });

      setExcelData(sheetData);
      setSheetNames(sheets);
      setSelectedSheet(sheets[0]);
      setUploadedFiles(prev => [...prev, result.filePath]);
      alert("File Successfully Uploaded");
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed.");
    }
  };

  return (
    <div className="bodyup">
      <Header />
      <div className="bodymain">
        <div className="upload-box">
          {/* Left Side */}
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
              <input type="file" id="file-upload" accept=".xlsx" onChange={handleFileUpload} hidden />
              <div className="filesize-note">max 50 MB</div>

              {/* Sheet Selector */}
              {sheetNames.length > 0 && (
                <select
                  value={selectedSheet}
                  onChange={(e) => setSelectedSheet(e.target.value)}
                  className="sheet-selector"
                >
                  {sheetNames.map((sheet, index) => (
                    <option key={index} value={sheet}>{sheet}</option>
                  ))}
                </select>
              )}

              {/* Sheet Data Table */}
              {selectedSheet && excelData[selectedSheet] && (
                <div className="excel-preview">
                  <table>
                    <tbody>
                      {excelData[selectedSheet].map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div className="upload-right">
            <p className="instruction">
              All names on the files uploaded will be converted and replaced with a ‘Releasing’ status.
              Please make sure of the names in the files before uploading.
            </p>

            <div className="file-list">
              <p><strong>Uploaded Files:</strong></p>
              {uploadedFiles.length === 0 ? (
                <p>No files uploaded yet.</p>
              ) : (
                uploadedFiles.map((filePath, index) => {
                  const fileName = filePath.split('/').pop();
                  return (
                    <div key={index} className="uploaded-file">
                      <a href={`http://localhost:3001${filePath}`} target="_blank" rel="noopener noreferrer">
                        {fileName}
                      </a>
                      <button className="remove-btn" onClick={() => confirmDelete(filePath)}>🗑</button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Are you sure you want to delete this file?</p>
            <div className="modal-actions">
              <button className="confirm-btn" onClick={handleDeleteConfirmed}>Yes</button>
              <button className="cancel-btn" onClick={handleCancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Upload;
