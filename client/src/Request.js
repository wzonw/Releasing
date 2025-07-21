import React, { useState, useEffect, useRef } from 'react';
import Header from './Header'; 
import axios from 'axios'; 
import './Request.css'; 

const Request = () => {
    const [search, setSearch] = useState({
        lastname: '',
        firstname: '',
        datesubmitted: '',
        degreeprogram: [],
        documenttype: [],
        status: [],
    });

    const [showCourseDropdown, setShowCourseDropdown] = useState(false);
    const [showDocumentTypeDropdown, setShowDocumentTypeDropdown] = useState(false);
    const [showStatusFilterDropdown, setShowStatusFilterDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7; 

    const courseDropdownRef = useRef(null);
    const documentTypeDropdownRef = useRef(null);
    const statusFilterDropdownRef = useRef(null);
    const statusModalDropdownRef = useRef(null);

    const courseOptions = ['BSIT', 'BSCS', 'BSA', 'BSN', 'BSED'];
    const documentTypeOptions = ['Transcript of Records', 'Good Moral Certificate', 'Diploma'];
    const statusOptions = ['READY', 'PROCESSING', 'CLAIMED', 'UNPAID'];

    const fetchRequests = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/requests');
            const allRequests = response.data;

            const newFilteredData = allRequests.filter(request => {
                const matchesLastName = search.lastname === '' || request.lastname.toLowerCase().includes(search.lastname.toLowerCase());
                const matchesFirstName = search.firstname === '' || request.firstname.toLowerCase().includes(search.firstname.toLowerCase());
                const matchesDate = search.datesubmitted === '' || request.datesubmitted.includes(search.datesubmitted);
                const matchesDegreeProgram = search.degreeprogram.length === 0 || search.degreeprogram.includes(request.degreeprogram);
                const matchesDocumentType = search.documenttype.length === 0 || search.documenttype.includes(request.documenttype);
                const matchesStatus = search.status.length === 0 || search.status.includes(request.status);

                return matchesLastName && matchesFirstName && matchesDate && matchesDegreeProgram && matchesDocumentType && matchesStatus;
            });

            setData(allRequests);
            setFilteredData(newFilteredData);
            setCurrentPage(1);
            console.log('Fetched and filtered requests:', newFilteredData);
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [search]);

    const handleSearchInputChange = (e) => {
        const { name, value } = e.target;
        setSearch(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (filterName, option) => {
        setSearch(prev => {
            const currentOptions = prev[filterName];
            let newOptions;

            if (option === 'Select All') {
                newOptions = currentOptions.length === getOptions(filterName).length
                    ? [] 
                    : getOptions(filterName); 
            } else {
                if (currentOptions.includes(option)) {
                    newOptions = currentOptions.filter(item => item !== option);
                } else {
                    newOptions = [...currentOptions, option];
                }
            }
            return { ...prev, [filterName]: newOptions };
        });
    };

    const getOptions = (filterName) => {
        switch (filterName) {
            case 'degreeprogram': return courseOptions;
            case 'documenttype': return documentTypeOptions;
            case 'status': return statusOptions;
            default: return [];
        }
    };

    const getDropdownHeaderText = (selectedItems, allOptions, defaultText) => {
        if (selectedItems.length === 0) {
            return defaultText;
        } else if (selectedItems.length === allOptions.length) {
            return 'All ' + defaultText.replace('Select ', '');
        } else if (selectedItems.length === 1) {
            return selectedItems[0];
        } else {
            return `${selectedItems.length} Selected`;
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target)) {
                setShowCourseDropdown(false);
            }
            if (documentTypeDropdownRef.current && !documentTypeDropdownRef.current.contains(event.target)) {
                setShowDocumentTypeDropdown(false);
            }
            if (statusFilterDropdownRef.current && !statusFilterDropdownRef.current.contains(event.target)) {
                setShowStatusFilterDropdown(false);
            }
            if (statusModalDropdownRef.current && !statusModalDropdownRef.current.contains(event.target) && showStatusDropdown) {
                setShowStatusDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showStatusDropdown]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    const handleRowClick = (request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
        setShowStatusDropdown(false);
    };

    const handleStatusChange = async (requestId, newStatus) => {
        try {
            const updatedby = "Trisha Ann"; 

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

            setSelectedRequest(prev => ({
                ...prev,
                status: newStatus 
            }));
            
            fetchRequests(); 
            alert("Status updated successfully!");
            setShowStatusDropdown(false); 
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Error updating status.");
        }
    };

    const handleDownloadList = () => {
        console.log("Download List button clicked!");
    };

    return (
        <div className="bodyreq">
            <div><Header /></div>
            <div className='container'>
                <div className='body'>
                    <div className="top-actions-bar-right">
                        <button className="download-list-button" onClick={handleDownloadList}>
                            <i className="fas fa-download"></i> Download List
                        </button>
                    </div>

                    <div className="filter-bar">
                        <div className="filter-input-wrapper">
                            <i className="fas fa-search search-icon"></i>
                            <input
                                type="text"
                                placeholder="Select Last Name"
                                name="lastname"
                                value={search.lastname}
                                onChange={handleSearchInputChange}
                            />
                        </div>
                        <div className="filter-input-wrapper">
                            <i className="fas fa-search search-icon"></i>
                            <input
                                type="text"
                                placeholder="Select First Name"
                                name="firstname"
                                value={search.firstname}
                                onChange={handleSearchInputChange}
                            />
                        </div>
                        <div className="filter-input-wrapper">
                            <input
                                type="text"
                                placeholder="YYYYMMDD"
                                name="datesubmitted"
                                value={search.datesubmitted}
                                onChange={handleSearchInputChange}
                                className="date-input"
                            />
                        </div>

                        <div className="custom-dropdown-container" ref={courseDropdownRef}>
                            <div className="dropdown-header" onClick={() => setShowCourseDropdown(!showCourseDropdown)}>
                                {getDropdownHeaderText(search.degreeprogram, courseOptions, "Select Course")}
                                <i className={`fas ${showCourseDropdown ? 'fa-chevron-up' : 'fa-chevron-down'} dropdown-arrow`}></i>
                            </div>
                            {showCourseDropdown && (
                                <div className="dropdown-menu">
                                    <div className="dropdown-item">
                                        <div className="custom-checkbox-wrapper">
                                            <input
                                                type="checkbox"
                                                id="selectAllCourse"
                                                checked={search.degreeprogram.length === courseOptions.length}
                                                onChange={() => handleMultiSelectChange('degreeprogram', 'Select All')}
                                            />
                                            <label htmlFor="selectAllCourse">Select All</label>
                                        </div>
                                    </div>
                                    {courseOptions.map(option => (
                                        <div key={option} className="dropdown-item">
                                            <div className="custom-checkbox-wrapper">
                                                <input
                                                    type="checkbox"
                                                    id={`course-${option.replace(/\s+/g, '-')}`}
                                                    checked={search.degreeprogram.includes(option)}
                                                    onChange={() => handleMultiSelectChange('degreeprogram', option)}
                                                />
                                                <label htmlFor={`course-${option.replace(/\s+/g, '-')}`}>{option}</label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="custom-dropdown-container" ref={documentTypeDropdownRef}>
                            <div className="dropdown-header" onClick={() => setShowDocumentTypeDropdown(!showDocumentTypeDropdown)}>
                                {getDropdownHeaderText(search.documenttype, documentTypeOptions, "Select Document Type")}
                                <i className={`fas ${showDocumentTypeDropdown ? 'fa-chevron-up' : 'fa-chevron-down'} dropdown-arrow`}></i>
                            </div>
                            {showDocumentTypeDropdown && (
                                <div className="dropdown-menu">
                                    <div className="dropdown-item">
                                        <div className="custom-checkbox-wrapper">
                                            <input
                                                type="checkbox"
                                                id="selectAllDocumentType"
                                                checked={search.documenttype.length === documentTypeOptions.length}
                                                onChange={() => handleMultiSelectChange('documenttype', 'Select All')}
                                            />
                                            <label htmlFor="selectAllDocumentType">Select All</label>
                                        </div>
                                    </div>
                                    {documentTypeOptions.map(option => (
                                        <div key={option} className="dropdown-item">
                                            <div className="custom-checkbox-wrapper">
                                                <input
                                                    type="checkbox"
                                                    id={`documentType-${option.replace(/\s+/g, '-')}`}
                                                    checked={search.documenttype.includes(option)}
                                                    onChange={() => handleMultiSelectChange('documenttype', option)}
                                                />
                                                <label htmlFor={`documentType-${option.replace(/\s+/g, '-')}`}>{option}</label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="custom-dropdown-container" ref={statusFilterDropdownRef}>
                            <div className="dropdown-header" onClick={() => setShowStatusFilterDropdown(!showStatusFilterDropdown)}>
                                {getDropdownHeaderText(search.status, statusOptions, "Select Status")}
                                <i className={`fas ${showStatusFilterDropdown ? 'fa-chevron-up' : 'fa-chevron-down'} dropdown-arrow`}></i>
                            </div>
                            {showStatusFilterDropdown && (
                                <div className="dropdown-menu">
                                    <div className="dropdown-item">
                                        <div className="custom-checkbox-wrapper">
                                            <input
                                                type="checkbox"
                                                id="selectAllStatus"
                                                checked={search.status.length === statusOptions.length}
                                                onChange={() => handleMultiSelectChange('status', 'Select All')}
                                            />
                                            <label htmlFor="selectAllStatus">Select All</label>
                                        </div>
                                    </div>
                                    {statusOptions.map(option => (
                                        <div key={option} className="dropdown-item">
                                            <div className="custom-checkbox-wrapper">
                                                <input
                                                    type="checkbox"
                                                    id={`status-${option.replace(/\s+/g, '-')}`}
                                                    checked={search.status.includes(option)}
                                                    onChange={() => handleMultiSelectChange('status', option)}
                                                />
                                                <label htmlFor={`status-${option.replace(/\s+/g, '-')}`}>{option}</label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button className="search-request-button" onClick={fetchRequests}>SEARCH REQUEST</button>
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
                            {paginatedData.map((request) => ( 
                                <tr key={request.id} onClick={() => handleRowClick(request)} className="table-row-clickable">
                                    <td className='Sname'>{request.lastname}</td>
                                    <td className='Sname'>{request.firstname}</td>
                                    <td>{request.datesubmitted}</td>
                                    <td>{request.degreeprogram}</td>
                                    <td>{request.documenttype}</td>
                                    <td><span className={`status-tag ${request.status?.toLowerCase().replace(/\s/g, '')}`}>{request.status}</span></td>
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

            {isModalOpen && selectedRequest && (
                <div className="modal-overlay">
                    <div className="modal-content-new">
                        <div className="modal-header-new">
                            <span className="request-information-text">Request Information</span>
                            <div className="modal-header-right">
                                <span className={`status-tag ${selectedRequest.status?.toLowerCase().replace(/\s/g, '')}`}>{selectedRequest.status}</span>
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
                                    name="status"
                                    value={selectedRequest.status}
                                    onChange={(e) => handleStatusChange(selectedRequest.id, e.target.value)}
                                    className="status-dropdown-new"
                                    ref={statusModalDropdownRef}
                                >
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
};

export default Request;