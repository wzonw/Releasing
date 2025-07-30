import React, { useState, useEffect, useRef, useCallback } from 'react'; // Import useCallback
import Header from './Header';
import axios from 'axios';
import './Request.css';

function Request() {
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

    // Removed the 'data' state as it was assigned but never used.
    // The 'allRequests' variable inside fetchRequests now serves its temporary purpose.
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const courseDropdownRef = useRef(null);
    const documentTypeDropdownRef = useRef(null);
    const statusFilterDropdownRef = useRef(null);
    const statusModalDropdownRef = useRef(null);

    const [courseOptions, setCourseOptions] = useState([]);
    const [documentTypeOptions, setDocumentTypeOptions] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);


    // Wrap fetchRequests in useCallback.
    // It now depends on 'search' because its internal logic uses the 'search' state.
    const fetchRequests = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/requests');
            const allRequests = response.data;

            // Extract dynamic values
            const uniqueCourses = [...new Set(allRequests.map(r => r.degreeprogram))];
            const uniqueDocumentTypes = [...new Set(allRequests.map(r => r.documenttype))];
            const uniqueStatuses = [...new Set(allRequests.map(r => r.status))];

            // Set them into state (you'll need to define them in useState)
            setCourseOptions(uniqueCourses);
            setDocumentTypeOptions(uniqueDocumentTypes);
            setStatusOptions(uniqueStatuses);

            // Continue with filtering...
            const newFilteredData = allRequests.filter(request => {
                const matchesLastName = search.lastname === '' || request.lastname.toLowerCase().includes(search.lastname.toLowerCase());
                const matchesFirstName = search.firstname === '' || request.firstname.toLowerCase().includes(search.firstname.toLowerCase());
                const matchesDate = search.datesubmitted === '' || request.daterequested.includes(search.datesubmitted);
                const matchesDegreeProgram = search.degreeprogram.length === 0 || search.degreeprogram.includes(request.degreeprogram);
                const matchesDocumentType = search.documenttype.length === 0 || search.documenttype.includes(request.documenttype);
                const matchesStatus = search.status.length === 0 || search.status.includes(request.status);

                return matchesLastName && matchesFirstName && matchesDate && matchesDegreeProgram && matchesDocumentType && matchesStatus;
            });

            setFilteredData(newFilteredData);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    }, [search]);

    // Request.jsx

    const resolveRemotePdf = (urlFromDb) => {
        return urlFromDb.replace('localhost', '192.168.55.120'); // Replace IP
    };

    // Since fetchRequests is memoized by useCallback, this won't cause infinite loops.
    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

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

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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
            const updatedby = "System"; //Enhance for per account update

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

            fetchRequests(); // Re-fetch data to update the table
            alert("Status updated successfully!");
            setShowStatusDropdown(false);
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Error updating status.");
        }
    };

    const handleDownloadList = () => {
        const headers = [
            'Last Name', 'First Name', 'Date of Request', 'Course',
            'Document Type', 'Status', 'Student Number', 'OR Number',
            'Year Admitted', 'Year Ended', 'Phone Number', 'College',
            'Email Address', 'Quantity', 'Total Amount', 'Purpose of Request'
        ];

        const dataToDownload = filteredData;

        const csvRows = dataToDownload.map(request => {
            const formatField = (field) => {
                if (field === null || field === undefined) return '';
                return `"${String(field).replace(/"/g, '""')}"`;
            };

            const row = [
                formatField(request.lastname),
                formatField(request.firstname),
                formatField(request.datesubmitted),
                formatField(request.degreeprogram),
                formatField(request.documenttype),
                formatField(request.status),
                formatField(request.studentnumber),
                formatField(request.ornumber),
                formatField(request.ayadmitted),
                formatField(request.graduationdate),
                formatField(request.phonenumber),
                formatField(request.selectedcollege),
                formatField(request.originalreceipt),
                formatField(request.emailaddress),
                formatField(request.quantity),
                formatField(request.totalamount),
                formatField(request.purpose)
            ];
            return row.join(',');
        });

        const csvContent = [headers.join(','), ...csvRows].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'requests_list.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
        console.log("Download List button clicked! CSV generated.");
    };

    return (
        <div className="bodyreq">
            <div><Header /></div>
            <div className='container'>
                <div className='body'>
                    {/* <div className="top-actions-bar-right"> */}
                        {/* <button className="download-list-button" onClick={handleDownloadList}> */}
                            {/* Download */}
                        {/* </button> */}
                    {/* </div> */}

                    <div className="filter-bar">
                        <div className="filter-input-wrapper">
                            <input
                                type="text"
                                placeholder="Select Last Name"
                                name="lastname"
                                value={search.lastname}
                                onChange={handleSearchInputChange}
                            />
                        </div>
                        <div className="filter-input-wrapper">
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
                                <span className="dropdown-arrow">{showCourseDropdown ? '▲' : '▼'}</span>
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
                                <span className="dropdown-arrow">{showDocumentTypeDropdown ? '▲' : '▼'}</span>
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
                                <span className="dropdown-arrow">{showStatusFilterDropdown ? '▲' : '▼'}</span>
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
                        <button className="download-list-button" onClick={handleDownloadList}>
                            Download
                        </button>
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
                                    <td>{request.daterequested}</td>
                                    <td>{request.degreeprogram}</td>
                                    <td>{request.documenttype}</td>
                                    <td><span className={`status-tag ${request.status?.toLowerCase().replace(/\s/g, '')}`}>{request.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="custom-pagination">
                      <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>&lt;</button>
                                            
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        const isFirst = page === 1;
                        const isLast = page === totalPages;
                        const isNearCurrent = Math.abs(page - currentPage) <= 1;
                    
                        if (isFirst || isLast || isNearCurrent) {
                          return (
                            <button
                              key={page}
                              className={currentPage === page ? 'page-btn active' : 'page-btn'}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </button>
                          );
                        }
                    
                        if (
                          (page === 2 && currentPage > 4) ||
                          (page === totalPages - 1 && currentPage < totalPages - 3) ||
                          Math.abs(page - currentPage) === 2
                        ) {
                          return <span key={page} className="dots">...</span>;
                        }
                        return null;
                      })}
                    
                      <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>&gt;</button>
                    </div>
                  
                </div>
            </div>

            {isModalOpen && selectedRequest && (
                <div className="modal-overlay">
                    <div className="modal-content-new">
                        {/* <div className="modal-header-new">
                            <span className="request-information-text">Request Information</span>
                            <div className="modal-header-right">
                                <span className={`status-tag ${selectedRequest.status?.toLowerCase().replace(/\s/g, '')}`}>{selectedRequest.status}</span>
                                <span className="reference-number">[{selectedRequest.formrequestid}]</span>
                            </div>
                        </div> */}
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
                            <div className="form-field"><label>Year Ended:</label><input type="text" value={selectedRequest.graduationdate} readOnly className="modal-input" /></div>
                            <div className="form-field"><label>Phone Number:</label><input type="text" value={selectedRequest.phonenumber} readOnly className="modal-input" /></div>
                            <div className="form-field college"><label>College:</label><input type="text" value={selectedRequest.selectedcollege} readOnly className="modal-input" /></div>
                            <div className="form-field full-width">
                                <label>Receipt:</label>
                                {selectedRequest.originalreceipt ? (
                                    <a
                                    href={resolveRemotePdf(selectedRequest.originalreceipt)}
                                    target="_blank" rel="noopener noreferrer" className="modal-input"
                                    >
                                    View Receipt
                                    </a>
                                ) : (
                                    <input type="text" value="No receipt uploaded" readOnly className="modal-input" />
                                )}
                            </div>                            <div className="form-field full-width"><label>Email Address:</label><input type="text" value={selectedRequest.emailaddress} readOnly className="modal-input" /></div>
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