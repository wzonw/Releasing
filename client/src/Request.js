import React, { useState, useEffect } from 'react';
import './Request.css';
import Header from './Header';
import axios from 'axios';

function Request() {
  const [search, setSearch] = useState({ lastName: '', firstName: '', dof: '', course: '', docType: '', status: '' });
  const [requests, setRequests] = useState([]);
  const [shelf, setShelfStatus] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false); // State to control status dropdown visibility
  const [currentPage, setCurrentPage] = useState(1);
  
  //Fetch all data from backend outgoing request table 
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/requests'); // Change if hosted elsewhere
        setRequests(response.data);
        console.log('Fetched requests:', response.data)
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };

    fetchRequests();
  }, []);

  //Fetch from shelf status but only the shelf status
  useEffect(() => {
  const fetchShelfStatus = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/shelfstatus');
      // console.log("SHELF STATUS RAW:", res.data);
      const statusMap = {};
      res.data.forEach(row => {
        statusMap[row.request_id] = row.shelfstatus;
      });
      setShelfStatus(statusMap);
      console.log('Fetched shelf status:', res.data);
    } catch (error) {
      console.error('Error fetching shelf status:', error);
    }
  };

  fetchShelfStatus();
}, []);

  const handleChange = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const filteredData = requests.filter((req) =>
    (req.lastname?.toLowerCase() ?? '').includes(search.lastName.toLowerCase()) &&
    (req.firstname?.toLowerCase() ?? '').includes(search.firstName.toLowerCase()) &&
    (req.datesubmitted?.toLowerCase() ?? '').includes(search.dof.toLowerCase()) &&
    (req.degreeprogram?.toLowerCase() ?? '').includes(search.course.toLowerCase()) &&
    (req.documenttype?.toLowerCase() ?? '').includes(search.docType.toLowerCase()) &&
    (req.shelf?.toLowerCase() ?? '').includes(search.status.toLowerCase())
  );


  const handleRowClick = (requests) => {
    console.log('Selected request:', requests);
    setSelectedRequest(requests);
    setIsModalOpen(true);
    setShowStatusDropdown(false); // Hide dropdown when opening modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === selectedRequest.id ? { ...req, status: newStatus } : req
      )
    );
    setSelectedRequest(prev => ({ ...prev, status: newStatus }));
    setShowStatusDropdown(false); 
    // setIsModalOpen(false); // Do not close modal after status update as per new UI
  };

  const itemsPerPage = 7;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);


  return (
    <div className="bodyreq">
      <div><Header/></div>
      <div className='container'>
        <div className='body'>
          <div className="filter-bar">
            <input type="text" placeholder="Select Last Name" name="lastName" value={requests.lastname} onChange={handleChange} />
            <input type="text" placeholder="Select First Name" name="firstName" value={requests.firstname} onChange={handleChange} />
            <input type="text" placeholder="YYYY/MM/DD" name="dof" onChange={handleChange} value={search.datesubmitted}></input>
            <input type= "text" placeholder="Search Course/Degree" name="course" onChange={handleChange} value={search.degreeprogram}>
            </input>
            <select name="docType" onChange={handleChange} value={search.documenttype}>
              <option value="">Select Document Type</option>
            </select>
            <select name="status" onChange={handleChange} value={search.status}>
              <option value="">Select Status</option>
              <option value="READY">READY</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="CLAIMED">CLAIMED</option>
            </select>
          </div>
          <table className="document-table">
            <thead>
              <tr>
                <th className='name'>Last Name</th>
                <th className='name'>First Name</th>
                <th>Date of Request</th>
                <th>Course</th>
                <th>Document Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((requests) => (
                <tr key={requests.id} onClick={() => handleRowClick(requests)} className="table-row-clickable">
                  <td className='Sname'>{requests.lastname}</td>
                  <td className='Sname'>{requests.firstname}</td>
                  <td>{requests.datesubmitted}</td>
                  <td>{requests.degreeprogram}</td>
                  <td>{requests.documenttype}</td>
                    <td><span className={`status-tag ${shelf[requests.id]?.toLowerCase()}`}>{shelf[requests.id]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <span>Page {currentPage} of {Math.ceil(filteredData.length / itemsPerPage)}</span>

          <button
            onClick={() =>
              setCurrentPage(prev =>
                Math.min(prev + 1, Math.ceil(filteredData.length / itemsPerPage))
              )
            }
            disabled={currentPage >= Math.ceil(filteredData.length / itemsPerPage)}
          >
            Next
          </button>
        </div>

        </div>
      </div>

      {/* Modal JSX structure */}
      {isModalOpen && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content-new"> {/* Changed class name for new styling */}
            <div className="modal-header-new">
              <span className="request-information-text">Request Information</span>
              <div className="modal-header-right">
                <span className={`status-tag ${selectedRequest.status.toLowerCase()}`}>{selectedRequest.status}</span>
                <span className="reference-number">[{selectedRequest.formrequestid}]</span>
              </div>
            </div>

            <div className="student-info-section">
              <div className="student-name-number">
                <span className="student-name">{selectedRequest.lastname}, {selectedRequest.firstname}</span>
                <span className="student-number">Student Number: {selectedRequest.studentnumber}</span>
              </div>
              <span className="receipt-number">[Receipt Number: {selectedRequest.ornumber}]</span>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>Course:</label>
                <input type="text" value={selectedRequest.degreeprogram} readOnly className="modal-input" />
              </div>
              <div className="form-field">
                <label>Year Started:</label>
                <input type="text" value={selectedRequest.ayadmitted} readOnly className="modal-input" />
              </div>
              <div className="form-field">
                <label>Year Ended:</label>
                <input type="text" value={selectedRequest.yearEnded} readOnly className="modal-input" />
              </div>
              <div className="form-field">
                <label>Phone Number:</label>
                <input type="text" value={selectedRequest.phoneNumber} readOnly className="modal-input" />
              </div>
              <div className="form-field">
                <label>Landline:</label>
                <input type="text" value={selectedRequest.landline} readOnly className="modal-input" />
              </div>
              <div className="form-field full-width">
                <label>Email Address:</label>
                <input type="text" value={selectedRequest.email} readOnly className="modal-input" />
              </div>
              <div className="form-field full-width">
                <label>Date of Request:</label>
                <input type="text" value={selectedRequest.datesubmitted} readOnly className="modal-input" />
              </div>
            </div>

            <div className="document-request-section">
              <label>Document Request:</label>
              <div className="document-request-table-container">
                <table className="document-request-table">
                  <thead>
                    <tr>
                      <th>Document Type</th>
                      <th>Qty.</th>
                      <th>Amount</th>
                      <th>Purpose of Request</th>
                    </tr>
                  </thead>
                  <tbody>
                      <td>{selectedRequest.documenttype}</td>
                      <td>{selectedRequest.quantity}</td>
                      <td>{selectedRequest.totalamount}</td>
                      <td>{selectedRequest.purpose}</td>
                  </tbody>
                </table>
              </div>
              <div className="total-amount-section">
                <span>Total Amount:</span>
                <input type="text" value={selectedRequest.totalamount} readOnly className="modal-input total-amount-input" />
              </div>
            </div>

            <div className="modal-actions-new">
              <button onClick={() => setShowStatusDropdown(!showStatusDropdown)} className="edit-status-button">
                EDIT STATUS
              </button>
              {showStatusDropdown && (
                <select
                  name="status"
                  value={selectedRequest.status}
                  onChange={handleStatusChange}
                  className="status-dropdown-new"
                >
                  <option value="READY">READY</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="CLAIMED">CLAIMED</option>
                </select>
              )}
              <button onClick={handleCloseModal} className="modal-close-button-new">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Request;
