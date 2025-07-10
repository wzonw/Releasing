import './Monitor.css';
import React, { useState } from 'react';
import './Request.css';

function Monitor() {
  const [search, setSearch] = useState({ lastName: '', firstName: '', dof: '', course: '', docType: '', status: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false); // State to control status dropdown visibility

  const [requests, setRequests] = useState([
    {
      id: 1,
      lastName: "MARTIN",
      firstName: "COCO FYANG",
      dof: "07-07-2025",
      course: "BAC",
      docType: "COG",
      status: "SHELF",
      studentNumber: "2020-001",
      yearStarted: "2020",
      yearEnded: "2024",
      phoneNumber: "09171234567",
      landline: "81234567",
      email: "coco.martin@example.com",
      referenceNumber: "REF001",
      receiptNumber: "REC001",
      documentRequests: [
        { docType: "COG", qty: 1, amount: "P300.00", purpose: "Job Application" }
      ],
      totalAmount: "P300.00"
    },
    {
      id: 2,
      lastName: "CHENG",
      firstName: "DOMINGO ANK",
      dof: "07-07-2025",
      course: "BSIT",
      docType: "COC",
      status: "PROCESSING",
      studentNumber: "2020-002",
      yearStarted: "2020",
      yearEnded: "2024",
      phoneNumber: "09172345678",
      landline: "82345678",
      email: "domingo.cheng@example.com",
      referenceNumber: "REF002",
      receiptNumber: "REC002",
      documentRequests: [
        { docType: "COC", qty: 1, amount: "P250.00", purpose: "Further Studies" }
      ],
      totalAmount: "P250.00"
    },
    {
      id: 3,
      lastName: "YAAMBOT",
      firstName: "PEAH LALA",
      dof: "07-07-2025",
      course: "BS PSYCH",
      docType: "TOR",
      status: "RELEASED",
      studentNumber: "2020-003",
      yearStarted: "2020",
      yearEnded: "2024",
      phoneNumber: "09173456789",
      landline: "83456789",
      email: "peah.yaambot@example.com",
      referenceNumber: "REF003",
      receiptNumber: "REC003",
      documentRequests: [
        { docType: "TOR", qty: 1, amount: "P500.00", purpose: "Visa Application" }
      ],
      totalAmount: "P500.00"
    },
    {
      id: 4,
      lastName: "NERY",
      firstName: "ARTHUR",
      dof: "07-07-2025",
      course: "BSN",
      docType: "COG",
      status: "SHELF",
      studentNumber: "2020-004",
      yearStarted: "2020",
      yearEnded: "2024",
      phoneNumber: "09174567890",
      landline: "84567890",
      email: "arthur.nery@example.com",
      referenceNumber: "REF004",
      receiptNumber: "REC004",
      documentRequests: [
        { docType: "COG", qty: 1, amount: "P300.00", purpose: "Personal Record" }
      ],
      totalAmount: "P300.00"
    },
    {
      id: 5,
      lastName: "NERY",
      firstName: "ARTHUR",
      dof: "07-07-2025",
      course: "BSN",
      docType: "COC",
      status: "SHELF",
      studentNumber: "2020-005",
      yearStarted: "2020",
      yearEnded: "2024",
      phoneNumber: "09175678901",
      landline: "85678901",
      email: "arthur.nery2@example.com",
      referenceNumber: "REF005",
      receiptNumber: "REC005",
      documentRequests: [
        { docType: "COC", qty: 1, amount: "P250.00", purpose: "Employment" }
      ],
      totalAmount: "P250.00"
    }
  ]);

  const handleChange = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const filteredData = requests.filter(item =>
    item.lastName.toLowerCase().includes(search.lastName.toLowerCase()) &&
    item.firstName.toLowerCase().includes(search.firstName.toLowerCase()) &&
    item.dof.toLowerCase().includes(search.dof.toLowerCase()) &&
    item.course.toLowerCase().includes(search.course.toLowerCase()) &&
    item.docType.toLowerCase().includes(search.docType.toLowerCase()) &&
    item.status.toLowerCase().includes(search.status.toLowerCase())
  );

  const handleRowClick = (request) => {
    setSelectedRequest(request);
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
    setShowStatusDropdown(false); // Hide dropdown after status update
    // setIsModalOpen(false); // Do not close modal after status update as per new UI
  };
  
  return (
    <div>
        <div className='monitor-header'>
         <img className='bg-image-mon' src='images/plm_trans.png' alt='PLM'/>
            <div className='bg-mon'>
                <img src="plm_logo.png" alt='PLM Logo' className='logo-mon'/>
                <h1 className='mon-title'>
                    Office of the University Registrar
                    <div className='sub-title'>
                        Pamantasan ng Lungsod ng Maynila
                    </div>
                </h1>
            </div>
        </div>
        <div className='monitor-body'>
            {/* Start */}
            <div className='monitor-container'>
                <div className='moncontainer'>
                    <div className='body'>
                    <div className="filter-mon">
                        <input type="text" placeholder="Select Last Name" name="lastName" value={search.lastName} onChange={handleChange} />
                        <input type="text" placeholder="Select First Name" name="firstName" value={search.firstName} onChange={handleChange} />
                        <select name="dof" onChange={handleChange} value={search.dof}>
                        <option value="">Select Date of Request</option>
                        <option value="07-07-2025">07-07-2025</option>
                        </select>
                        <select name="course" onChange={handleChange} value={search.course}>
                        <option value="">Select Course</option>
                        <option value="BAC">BAC</option>
                        <option value="BSIT">BSIT</option>
                        <option value="BS PSYCH">BS PSYCH</option>
                        <option value="BSN">BSN</option>
                        </select>
                        <select name="docType" onChange={handleChange} value={search.docType}>
                        <option value="">Select Document Type</option>
                        <option value="COG">COG</option>
                        <option value="COC">COC</option>
                        <option value="TOR">TOR</option>
                        </select>
                        <select name="status" onChange={handleChange} value={search.status}>
                        <option value="">Select Status</option>
                        <option value="SHELF">SHELF</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="RELEASED">RELEASED</option>
                        <option value="CLAIMED">CLAIMED</option>
                        </select>
                    </div>
                    <table className="document-table">
                        <thead>
                        <tr>
                            <th>Last Name</th>
                            <th>First Name</th>
                            <th>Date of Request</th>
                            <th>Course</th>
                            <th>Document Type</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredData.map((item) => (
                            <tr key={item.id} onClick={() => handleRowClick(item)} className="table-row-clickable">
                            <td>{item.lastName}</td>
                            <td>{item.firstName}</td>
                            <td>{item.dof}</td>
                            <td>{item.course}</td>
                            <td>{item.docType}</td>
                            <td><span className={`status-tag ${item.status.toLowerCase()}`}>{item.status}</span></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
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
                            <span className="reference-number">[{selectedRequest.referenceNumber}]</span>
                        </div>
                        </div>

                        <div className="student-info-section">
                        <div className="student-name-number">
                            <span className="student-name">{selectedRequest.lastName}, {selectedRequest.firstName}</span>
                            <span className="student-number">Student Number: {selectedRequest.studentNumber}</span>
                        </div>
                        <span className="receipt-number">[Receipt Number: {selectedRequest.receiptNumber}]</span>
                        </div>

                        <div className="form-grid">
                        <div className="form-field">
                            <label>Course:</label>
                            <input type="text" value={selectedRequest.course} readOnly className="modal-input" />
                        </div>
                        <div className="form-field">
                            <label>Year Started:</label>
                            <input type="text" value={selectedRequest.yearStarted} readOnly className="modal-input" />
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
                            <input type="text" value={selectedRequest.dof} readOnly className="modal-input" />
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
                                {selectedRequest.documentRequests.map((doc, index) => (
                                <tr key={index}>
                                    <td>{doc.docType}</td>
                                    <td>{doc.qty}</td>
                                    <td>{doc.amount}</td>
                                    <td>{doc.purpose}</td>
                                </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                        <div className="total-amount-section">
                            <span>Total Amount:</span>
                            <input type="text" value={selectedRequest.totalAmount} readOnly className="modal-input total-amount-input" />
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
                            <option value="SHELF">SHELF</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="RELEASED">RELEASED</option>
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
            {/* End */}
        </div>
    </div>
  )
}

export default Monitor