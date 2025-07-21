  import React, { useState, useEffect } from 'react';
  import './Request.css';
  import Header from './Header';
  import axios from 'axios';

  function Request() {
    const [search, setSearch] = useState({
      lastname: '',
      firstname: '',
      datesubmitted: '',
      degreeprogram: '',
      documenttype: '',
      status: ''
    });
    const [requests, setRequests] = useState([]);
    // const [shelf, setShelfStatus] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch all data from backend with search filters
    const fetchRequests = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/requests', { params: search });
        setRequests(response.data);
        console.log('Fetched filtered requests:', response.data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };
    useEffect(() => {
      fetchRequests();
    }, [search]);


    // Fetch shelf status = NOT IN USE ANYMORE
    // useEffect(() => {
    //   const fetchShelfStatus = async () => {
    //     try {
    //       const res = await axios.get('http://localhost:3001/api/shelfstatus');
    //       const statusMap = {};
    //       res.data.forEach(row => {
    //         statusMap[row.request_id] = row.shelfstatus;
    //       });
    //       setShelfStatus(statusMap);
    //       console.log('Fetched shelf status:', res.data);
    //     } catch (error) {
    //       console.error('Error fetching shelf status:', error);
    //     }
    //   };

    //   fetchShelfStatus();
    // }, []);

    const handleChange = (e) => {
      setSearch({ ...search, [e.target.name]: e.target.value });
    };

    const filteredData = requests.filter((req) =>
      (req.lastname?.toLowerCase() ?? '').includes(search.lastname.toLowerCase()) &&
      (req.firstname?.toLowerCase() ?? '').includes(search.firstname.toLowerCase()) &&
      (req.datesubmitted?.toLowerCase() ?? '').includes(search.datesubmitted.toLowerCase()) &&
      (req.degreeprogram?.toLowerCase() ?? '').includes(search.degreeprogram.toLowerCase()) &&
      (req.documenttype?.toLowerCase() ?? '').includes(search.documenttype.toLowerCase()) &&
      (req.status?.toLowerCase() ?? '').includes(search.status.toLowerCase())
    );

    const handleRowClick = (requests) => {
      setSelectedRequest(requests);
      setIsModalOpen(true);
      setShowStatusDropdown(false);
    };

    const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedRequest(null);
    };


    const handleStatusChange = async (requestId, newStatus) => {
      try {
        const updatedby = "Trisha Ann"; // Replace this with actual logged in user if needed

        const response = await fetch("http://localhost:3001/api/update-status", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            request_id: requestId,
            shelfstatus: newStatus,
            updatedby: updatedby
          })
        });

        if (!response.ok) throw new Error("Update failed");

        alert("Status updated successfully!");
        fetchRequests(); // <-- Make sure this function is defined
      } catch (err) {
        console.error("Error updating status:", err);
        alert("Error updating status.");
      }
    };


    const itemsPerPage = 7;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return (
      <div className="bodyreq">
        <div><Header /></div>
        <div className='container'>
          <div className='body'>
            <div className="filter-bar">
              <input
                type="text"
                placeholder="Select Last Name"
                name="lastname"
                value={search.lastname}
                onChange={handleChange}
              />
              <input
                type="text"
                placeholder="Select First Name"
                name="firstname"
                value={search.firstname}
                onChange={handleChange}
              />
              <input
                type="text"
                placeholder="YYYY/MM/DD"
                name="datesubmitted"
                value={search.datesubmitted}
                onChange={handleChange}
              />
              <input
                type="text"
                placeholder="Search Course/Degree"
                name="degreeprogram"
                value={search.degreeprogram}
                onChange={handleChange}
              />
              <select name="documenttype" value={search.documenttype} onChange={handleChange}>
                <option value="">Select Document Type</option>
                <option value="Transcript of Records">Transcript of Records</option>
                <option value="Diploma">Diploma</option>
                <option value="Certificate">Certificate</option>
              </select>
              <select name="status" value={search.status} onChange={handleChange}>
                <option value="">Select Status</option>
                <option value="READY">READY</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="CLAIMED">CLAIMED</option>
                <option value="UNPAID">UNPAID</option>
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
                    <td><span className={`status-tag ${requests.status?.toLowerCase()}`}>{requests.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                Previous
              </button>
              <span>Page {currentPage} of {Math.ceil(filteredData.length / itemsPerPage)}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredData.length / itemsPerPage)))}
                disabled={currentPage >= Math.ceil(filteredData.length / itemsPerPage)}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && selectedRequest && (
          <div className="modal-overlay">
            <div className="modal-content-new">
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
                <div className="form-field"><label>Course:</label><input type="text" value={selectedRequest.degreeprogram} readOnly className="modal-input" /></div>
                <div className="form-field"><label>Year Started:</label><input type="text" value={selectedRequest.ayadmitted} readOnly className="modal-input" /></div>
                <div className="form-field"><label>Year Ended:</label><input type="text" value={selectedRequest.yearEnded} readOnly className="modal-input" /></div>
                <div className="form-field"><label>Phone Number:</label><input type="text" value={selectedRequest.phoneNumber} readOnly className="modal-input" /></div>
                <div className="form-field"><label>Landline:</label><input type="text" value={selectedRequest.landline} readOnly className="modal-input" /></div>
                <div className="form-field full-width"><label>Email Address:</label><input type="text" value={selectedRequest.email} readOnly className="modal-input" /></div>
                <div className="form-field full-width"><label>Date of Request:</label><input type="text" value={selectedRequest.datesubmitted} readOnly className="modal-input" /></div>
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
                      <tr>
                        <td>{selectedRequest.documenttype}</td>
                        <td>{selectedRequest.quantity}</td>
                        <td>{selectedRequest.totalamount}</td>
                        <td>{selectedRequest.purpose}</td>
                      </tr>
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
                  value={selectedRequest.status} 
                  onChange={(e) => handleStatusChange(selectedRequest.id, e.target.value)}
                  className="status-dropdown-new">
                    <option value="READY">READY</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="CLAIMED">CLAIMED</option>
                    <option value="UNPAID">UNPAID</option>
                  </select>
                )}
                <button onClick={handleCloseModal} className="modal-close-button-new">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  export default Request;
