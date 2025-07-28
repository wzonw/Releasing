import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Header from './Header';
import './Upload.css';

function Upload() {
  const importantColumns = ['last name', 'first name', 'documents'];
  const [selectedRows, setSelectedRows] = useState([]);
  const [excelData, setExcelData] = useState({});
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [currentFileName, setCurrentFileName] = useState('');
  const [parsedSheetData, setParsedSheetData] = useState([]);


  useEffect(() => {
    fetch('http://localhost:3001/files')
      .then(res => res.json())
      .then(data => setUploadedFiles(data))
      .catch(err => console.error('Failed to load files:', err));
  }, []);

  const confirmDelete = (filePath) => {
    setFileToDelete(filePath);
    setShowConfirm(true);
  };


  //save to database button
const handleVerifyData = async () => {
  if (!parsedSheetData.length) {
    alert("No data to verify.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3001/verify-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ data: selectedRows  })
    });

    if (!response.ok) throw new Error("Failed to verify data");

    const result = await response.json();
    console.log("Verification result:", result);

    alert("Verification completed!");
  } catch (err) {
    console.error("Verification failed:", err);
    alert("Error verifying data.");
  }
};



  //File viewer for when clicking sa mga uploaded
const handleFileClick = async (fileName) => {
    try {
      const response = await fetch(`http://localhost:3001/annex/${fileName}`);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

const sheetData = {};
const sheets = workbook.SheetNames;
let firstSheetParsedData = [];

sheets.forEach(sheet => {
  const worksheet = workbook.Sheets[sheet];

  // Object-based version for saving to DB
  const objectData = XLSX.utils.sheet_to_json(worksheet, {
    range: 13, // Row 14
    defval: ''
  });

  // 2D array version for preview
  const arrayData = [Object.keys(objectData[0] || {}), ...objectData.map(Object.values)];
  sheetData[sheet] = arrayData;

  // Save first sheet's object data for DB
  if (sheet === sheets[0]) {
    firstSheetParsedData = objectData;
  }
});

setParsedSheetData(firstSheetParsedData); // Save button
setExcelData(sheetData);
setSheetNames(sheets);
setSelectedSheet(sheets[0]);
setCurrentFileName(fileName);
setShowPreview(true);

    } catch (err) {
      alert("Error loading file.");
      console.error(err);
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setExcelData({});
    setSheetNames([]);
    setSelectedSheet('');
    setCurrentFileName('');
  };

  const handleDeleteConfirmed = () => {
    const fileName = fileToDelete.split('/').pop();

    fetch(`http://localhost:3001/delete/${fileName}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Delete failed');
        return res.json();
      })
      .then(() => {
        setUploadedFiles((prev) => prev.filter((f) => f !== fileToDelete));
        setFileToDelete(null);
        alert('File Successfully Deleted');
        setShowConfirm(false);
        
        // If currently previewing the deleted file, close preview
        if (currentFileName === fileName) {
          closePreview();
        }
      })
      .catch((err) => {
        console.error('Error deleting from backend:', err);
        alert('Failed to delete file on the server.');
        setShowConfirm(false);
      });
  };

  const handleCancelDelete = () => {
    setFileToDelete(null);
    setShowConfirm(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const isXlsx = file.name.endsWith('.xlsx');
    const isMimeCorrect = file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    if (!file || !isXlsx || !isMimeCorrect) {
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

      setUploadedFiles(prev => [...prev, result.filePath]);
      alert("File Successfully Uploaded");
      
      // Close any existing preview
      closePreview();
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed.");
    }
  };

  const renderExcelList = () => {
      if (!selectedSheet || !excelData[selectedSheet]) return null;

      const data = excelData[selectedSheet];
      if (data.length === 0) return <p>No data in selected sheet.</p>;

      const headers = data[0];
      const rows = data.slice(1);

      const getRowObject = (row) => {
      const normalizedRow = Object.fromEntries(
        headers.map((header, i) => [header.trim().toLowerCase(), row[i]])
      );

      const result = {};
      importantColumns.forEach(col => {
        const lowerCol = col.toLowerCase();
        result[col] = normalizedRow[lowerCol] || '';
      });

      return result;
    };


      const allRowObjects = rows.map(getRowObject);

      const isRowSelected = (rowObject) => {
        return selectedRows.some(
          selected => JSON.stringify(selected) === JSON.stringify(rowObject)
        );
      };

      const toggleRow = (index) => {
        const rowObject = getRowObject(rows[index]);
        const alreadySelected = isRowSelected(rowObject);

        if (alreadySelected) {
          setSelectedRows(selectedRows.filter(
            row => JSON.stringify(row) !== JSON.stringify(rowObject)
          ));
        } else {
          setSelectedRows([...selectedRows, rowObject]);
        }
      };

      const allSelected = allRowObjects.every(isRowSelected);

      const handleSelectAllToggle = () => {
        if (allSelected) {
          // Unselect all
          setSelectedRows([]);
        } else {
          // Select all
          setSelectedRows(allRowObjects);
        }
      };

      return (
        <div className="list-preview">
          {/* Select All Checkbox */}
          <div className="list-item select-all">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAllToggle}
            />
            <strong>Select All</strong>
          </div>

          {/* Individual List Items */}
          {rows.map((row, rowIndex) => {
            const rowObject = getRowObject(row);
            const isSelected = isRowSelected(rowObject);

            return (
              <div key={rowIndex} className="list-item">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleRow(rowIndex)}
                />
                <span>
                  {importantColumns.map(col => `${rowObject[col] || ''}`).join(' | ')}
                </span>
              </div>
            );
          })}
        </div>
      );
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

            <div className={`dropzone ${showPreview ? 'showing-preview' : ''}`}>
              <div className="upload-content">
                <div className="drop-icon">📁</div>
                <p className="drop-text">Upload an Excel File</p>
                  <label htmlFor="file-upload" className="upload-btn">
                    <span className="icon">⬆</span> BROWSE
                  </label>
                  <input 
                    type="file" 
                    id="file-upload" 
                    accept=".xlsx" 
                    onChange={handleFileUpload} 
                    hidden 
                  />
              </div>
              
              <div className="filesize-note">max 50 MB</div>

              {/* Excel Preview */}
              {showPreview && (
                <div className="excel-preview">
                  <div className="excel-preview-header">
                    <h5>Preview: {currentFileName}</h5>
                    <div>
                      {sheetNames.length > 1 && (
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
                        <button className="save-btn" onClick={handleVerifyData}>
                          Save
                        </button>
                      <label htmlFor="file-upload" className="upload-btn">
                          Browse
                      </label>
                    </div>
                  </div>
                  
                  <div className="excel-table-container">
                    {renderExcelList()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div className="upload-right">
            <p className="instruction">
              All names on the files uploaded will be converted and replaced with a 'Releasing' status.
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
                      <span onClick={() => handleFileClick(fileName)}>
                        {fileName}
                      </span>
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