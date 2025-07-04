import React, { useState } from 'react';
import './Request.css';
import Header from './Header';

function Request() {
  const [search, setSearch] = useState({ lastName: '', firstName: '', course: '', docType: '', status: '' });

  const data = [
    { lastName: "MARTIN", firstName: "COCO FYANG", middleName: "ABAD", course: "BAC", docType: "COG", status: "SHELF" },
    { lastName: "CHENG", firstName: "DOMINGO ANK", middleName: "SMITH", course: "BSIT", docType: "COC", status: "PROCESSING" },
    { lastName: "YAAMBOT", firstName: "PEAH LALA", middleName: "DANAYA", course: "BS PSYCH", docType: "TOR", status: "RELEASED" },
    { lastName: "NERY", firstName: "ARTHUR", middleName: "", course: "BSN", docType: "COG", status: "SHELF" },
    { lastName: "NERY", firstName: "ARTHUR", middleName: "", course: "BSN", docType: "COC", status: "SHELF" }
  ];

  const handleChange = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const filteredData = data.filter(item =>
    item.lastName.toLowerCase().includes(search.lastName.toLowerCase()) &&
    item.firstName.toLowerCase().includes(search.firstName.toLowerCase()) &&
    item.course.toLowerCase().includes(search.course.toLowerCase()) &&
    item.docType.toLowerCase().includes(search.docType.toLowerCase()) &&
    item.status.toLowerCase().includes(search.status.toLowerCase())
  );

  return (
    <div className="container">
        <div><Header/></div>
        <div className='body'>
            <div className="filter-bar">
                <input type="text" placeholder="Select Last Name" name="lastName" value={search.lastName} onChange={handleChange} />
                <input type="text" placeholder="Select First Name" name="firstName" value={search.firstName} onChange={handleChange} />
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
                </select>
            </div>
            <table className="document-table">
                <thead>
                <tr>
                    <th>Last Name</th>
                    <th>First Name</th>
                    <th>Middle Name</th>
                    <th>Course</th>
                    <th>Document Type</th>
                    <th>Status</th>
                </tr>
                </thead>
                <tbody>
                {filteredData.map((item, idx) => (
                    <tr key={idx}>
                    <td>{item.lastName}</td>
                    <td>{item.firstName}</td>
                    <td>{item.middleName}</td>
                    <td>{item.course}</td>
                    <td>{item.docType}</td>
                    <td><span className={`status-tag ${item.status.toLowerCase()}`}>{item.status}</span></td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    </div>
  );
}

export default Request;
