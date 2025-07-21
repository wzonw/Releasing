import React, { useState, useEffect, useRef } from 'react';
import Header from './Header'; // Assuming Header.js is in the same directory
import axios from 'axios'; // Assuming you have axios installed for API calls
import './Request.css'; // Make sure this path is correct for your CSS file

const Request = () => {
    // State for search filters
    const [search, setSearch] = useState({
        lastname: '',
        firstname: '',
        datesubmitted: '',
        degreeprogram: [],
        documenttype: [],
        status: [],
    });

    // State for dropdown visibility
    const [showCourseDropdown, setShowCourseDropdown] = useState(false);
    const [showDocumentTypeDropdown, setShowDocumentTypeDropdown] = useState(false);
    const [showStatusFilterDropdown, setShowStatusFilterDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false); // For modal status dropdown

    // State for modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // State for data and pagination
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Options for dropdowns (replace with your actual options or fetch from API)
    const courseOptions = ['BS INFORMATION TECHNOLOGY', 'BS PSYCHOLOGY', 'BS ARCHITECTURE'];
    const documentTypeOptions = ['Transcript of Records', 'Good Moral Certificate', 'Certificate of Enrollment'];
    const statusOptions = ['For Release', 'Processing', 'Claimed', 'Unpaid'];

    // Refs for clicking outside dropdowns
    const courseDropdownRef = useRef(null);
    const documentTypeDropdownRef = useRef(null);
    const statusFilterDropdownRef = useRef(null);

    // Fetch data (example, replace with your actual API endpoint)
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Replace with your actual API endpoint
                const response = await axios.get('http://localhost:5000/api/requests'); // Example endpoint
                setData(response.data);
                setFilteredData(response.data); // Initialize filtered data with all data
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    // Effect for filtering data whenever search state changes
    useEffect(() => {
        const applyFilters = () => {
            let temp = data.filter(request => {
                const matchesLastName = search.lastname
                    ? request.lastname.toLowerCase().includes(search.lastname.toLowerCase())
                    : true;
                const matchesFirstName = search.firstname
                    ? request.firstname.toLowerCase().includes(search.firstname.toLowerCase())
                    : true;
                const matchesDateSubmitted = search.datesubmitted
                    ? request.datesubmitted.includes(search.datesubmitted) // Assuming YYYYMMDD format
                    : true;
                const matchesDegreeProgram = search.degreeprogram.length > 0
                    ? search.degreeprogram.includes(request.degreeprogram)
                    : true;
                const matchesDocumentType = search.documenttype.length > 0
                    ? search.documenttype.includes(request.documenttype)
                    : true;
                const matchesStatus = search.status.length > 0
                    ? search.status.includes(request.status)
                    : true;

                return matchesLastName && matchesFirstName && matchesDateSubmitted &&
                       matchesDegreeProgram && matchesDocumentType && matchesStatus;
            });
            setFilteredData(temp);
            setCurrentPage(1); // Reset to first page on filter change
        };
        applyFilters();
    }, [search, data]); // Depend on search and data

    // Handle search input changes (for text fields)
    const handleSearchInputChange = (e) => {
        const { name, value } = e.target;
        setSearch(prev => ({ ...prev, [name]: value }));
    };

    // Handle multi-select dropdown changes
    const handleMultiSelectChange = (filterName, option) => {
        setSearch(prev => {
            const currentOptions = prev[filterName];
            let newOptions;

            if (option === 'Select All') {
                newOptions = currentOptions.length === getOptions(filterName).length
                    ? [] // Deselect all
                    : getOptions(filterName); // Select all
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

    // Helper to get options for a given filter name
    const getOptions = (filterName) => {
        switch (filterName) {
            case 'degreeprogram': return courseOptions;
            case 'documenttype': return documentTypeOptions;
            case 'status': return statusOptions;
            default: return [];
        }
    };

    // Get header text for dropdowns
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

    // Handle clicks outside dropdowns to close them
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
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    // Modal Handlers
    const handleRowClick = (request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
        setShowStatusDropdown(false); // Close status dropdown when modal closes
    };

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        setSelectedRequest(prev => ({ ...prev, status: newStatus }));
        // In a real app, you'd likely send this update to your backend here
        console.log(`Updating request ${selectedRequest.formrequestid} status to: ${newStatus}`);
    };

    const handleDownloadList = () => {
        // Implement your download list logic here
        alert('Download List functionality will be implemented here!');
    };

    return (
        <div className="bodyreq">
            <div><Header /></div>
            <div className='container'>
                <div className='body'>
                    {/* Top actions bar - Only Download List button remains */}
                    <div className="top-actions-bar-right"> {/* New class for right alignment */}
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

                        {/* Custom Dropdown for Course */}
                        <div className="custom-dropdown-container" ref={courseDropdownRef}>
                            <div className="dropdown-header" onClick={() => setShowCourseDropdown(!showCourseDropdown)}>
                                {getDropdownHeaderText(search.degreeprogram, courseOptions, "Select Course")}
                                <i className={`fas ${showCourseDropdown ? 'fa-chevron-up' : 'fa-chevron-down'} dropdown-arrow`}></i>
                            </div>
                            {showCourseDropdown && (
                                <div className="dropdown-menu">
                                    {/* "Select All" Option */}
                                    <div className="dropdown-item">
                                        {/* CRITICAL: Add custom-checkbox-wrapper around input and label */}
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
                                    {/* Individual Course Options */}
                                    {courseOptions.map(option => (
                                        <div key={option} className="dropdown-item">
                                            {/* CRITICAL: Add custom-checkbox-wrapper around input and label */}
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

                        {/* Custom Dropdown for Document Type */}
                        <div className="custom-dropdown-container" ref={documentTypeDropdownRef}>
                            <div className="dropdown-header" onClick={() => setShowDocumentTypeDropdown(!showDocumentTypeDropdown)}>
                                {getDropdownHeaderText(search.documenttype, documentTypeOptions, "Select Document Type")}
                                <i className={`fas ${showDocumentTypeDropdown ? 'fa-chevron-up' : 'fa-chevron-down'} dropdown-arrow`}></i>
                            </div>
                            {showDocumentTypeDropdown && (
                                <div className="dropdown-menu">
                                    <div className="dropdown-item">
                                        {/* CRITICAL: Add custom-checkbox-wrapper around input and label */}
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
                                            {/* CRITICAL: Add custom-checkbox-wrapper around input and label */}
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

                        {/* Custom Dropdown for Status */}
                        <div className="custom-dropdown-container" ref={statusFilterDropdownRef}>
                            <div className="dropdown-header" onClick={() => setShowStatusFilterDropdown(!showStatusFilterDropdown)}>
                                {getDropdownHeaderText(search.status, statusOptions, "Select Status")}
                                <i className={`fas ${showStatusFilterDropdown ? 'fa-chevron-up' : 'fa-chevron-down'} dropdown-arrow`}></i>
                            </div>
                            {showStatusFilterDropdown && (
                                <div className="dropdown-menu">
                                    <div className="dropdown-item">
                                        {/* CRITICAL: Add custom-checkbox-wrapper around input and label */}
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
                                            {/* CRITICAL: Add custom-checkbox-wrapper around input and label */}
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
                        <button className="search-request-button">SEARCH REQUEST</button>
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
                                    <td><span className={`status-tag ${requests.status?.toLowerCase().replace(/\s/g, '')}`}>{requests.status}</span></td>
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
                                <span className={`status-tag ${selectedRequest.status.toLowerCase().replace(/\s/g, '')}`}>{selectedRequest.status}</span>
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
                                <select name="status" value={selectedRequest.status} onChange={handleStatusChange} className="status-dropdown-new">
                                    <option value="For Release">For Release</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Claimed">Claimed</option>
                                    <option value="Unpaid">Unpaid</option>
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