import { useState, useEffect } from 'react';
import './Dashboard.css';
import axios from 'axios';
import Header from './Header';
import { BarChart } from '@mui/x-charts/BarChart';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

function Dashboard() {
const [collegeData, setCollegeData] = useState({});
const [statusSummary, setStatusSummary] = useState({
  Processing: 0,
  Ready: 0,
  Claimed: 0,
  Total: 0
});
const [stackedMode, setStackedMode] = useState(false);
const [selectedDate, setSelectedDate] = useState(new Date());
const type = ['Processing', 'Ready', 'Claimed', 'Total'];
const val = [
  statusSummary.Processing,
  statusSummary.Ready,
  statusSummary.Claimed,
  statusSummary.Total
];
const barColors = ['#1d4ed8', '#22c55e', '#a21caf', '#f59e42'];


useEffect(() => {
  axios.get('/api/status-summary')
    .then(res => setStatusSummary(res.data))
    .catch(err => console.error('Fetch failed:', err));
}, []);

useEffect(() => {
  axios.get('/api/status-by-college')
    .then(res => setCollegeData(res.data))
    .catch(err => console.error('College status fetch failed:', err));
}, []);

function createData(name, total) {
  return { name, total };
}

const rows = [];
const collegeLabels = Object.keys(collegeData);
collegeLabels.forEach(college => {
  const data = collegeData[college] || {};
  const total = data.Total || 0;
  rows.push(createData(college, total));
});
rows.sort((a, b) => a.name.localeCompare(b.name));
const requestSubmitted = collegeLabels.map(college => collegeData[college]?.Ready || 0);
const documentsReleased = collegeLabels.map(college => collegeData[college]?.Claimed || 0);

  return (
    <div className=" ">
      <div className='bgcolor'></div>
      {/* Visually hiding fallback alt text */}
      <img
        src="/images/PLM.jpg"
        alt=""
        className='dashbg'
        aria-hidden="true"
      />
      <div className='dash-bg'>
        <Header />
        <div className='dashboard-grid'>
          <div className="overview-container">
            <div className="overview-card">
              <div className="overview-left">
                <h2>Document Overview</h2>
                <p className="total-label">Total Requests</p>
                <h1 className="total-count">{statusSummary.Total}</h1>
                <div className="breakdown">
                  <p>Processing <span>{statusSummary.Processing}</span></p>
                  <p>Ready <span>{statusSummary.Ready}</span></p>
                </div>
              </div>

              <div className="overview-right">
                <div className="dropdown-button">
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Select Date"
                      value={selectedDate}
                      onChange={(newDate) => setSelectedDate(newDate)}
                      minDate={new Date('2024-01-01')}
                      maxDate={new Date('2050-12-31')}
                      slotProps={{ textField: { size: 'small' } }}
                    />
                  </LocalizationProvider>
                </div>
              </div>
            </div>
          </div>

          <div className='doc-reqs'>
            <div className='req-header'>
              <h1>Request Status</h1>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="course-btn" onClick={() => setStackedMode(!stackedMode)}>
                  {stackedMode ? 'Show Overview' : 'Show Course'}
                </button>
              </div>
            </div>

            {!stackedMode ? (
              <BarChart
                className='docs'
                xAxis={[
                  {
                    data: type,
                    scaleType: 'band',
                    colorMap: {
                      type: 'ordinal',
                      colors: barColors,
                    },
                  }
                ]}
                series={[{ data: val }]}
                height={350}
              />
            ) : (
              <BarChart
                className='docs'
                xAxis={[{ data: collegeLabels, scaleType: 'band' }]}
                series={[
                  { data: requestSubmitted, label: 'Ready', stack: 'A' },
                  { data: documentsReleased, label: 'Documents Claimed', stack: 'A' },                ]}
                height={350}
              />
            )}
          </div>

          <div className='sum-table'>
            <TableContainer className='table' component={Paper}>
              <Table sx={{ minWidth: 0 }} aria-label="summary table">
                <TableHead>
                  <TableRow>
                    <TableCell className='table-header'>Colleges</TableCell>
                    <TableCell className='table-header' align="center">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell align="center">{row.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
