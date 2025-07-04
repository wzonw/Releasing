import { useState } from 'react';
import './Dashboard.css';
import Header from './Header';
import { BarChart } from '@mui/x-charts/BarChart';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const type = ['Pending', 'Processing', 'Shelf', 'Released', 'Total Requests'];
const val = [123, 312, 123, 321, 1000];
const barColors = ['#1d4ed8', '#22c55e', '#f59e42', '#e11d48', '#a21caf'];

function Dashboard() {
  const [filter, setFilter] = useState('All Time');
  const [showDropdown, setShowDropdown] = useState(false);
  const [stackedMode, setStackedMode] = useState(false);

  const filters = ['All Time', 'Last Week', 'Last Month', 'Last Year'];

  const handleSelect = (option) => {
    setFilter(option);
    setShowDropdown(false);
  };

  function createData(name, Undergraduates, Graduates, Total) {
    return { name, Undergraduates, Graduates, Total };
  }

  const rows = [
    createData('CET', 159, 60, 219),
    createData('CISTM', 237, 90, 327),
    createData('CN', 262, 160, 422),
    createData('CTHM', 305, 37, 342),
    createData('Gingerbread', 356, 160, 516),
    createData('Kopiko', 237, 90, 327),
    createData('Fyang Coco Martin', 262, 160, 422),
    createData('Cupcake', 305, 37, 342),
    createData('CTHM', 305, 37, 342),
    createData('Gingerbread', 356, 160, 516),
    createData('Kopiko', 237, 90, 327),
    createData('Fyang Coco Martin', 262, 160, 422),
    createData('Cupcake', 305, 37, 342),
  ];

  // Data for stacked chart
  const collegeLabels = ['CASBE', 'CHASS', 'CS', 'CISTM', 'CN', 'LAW', 'CET', 'BSA', 'CPT', 'CED', 'SOG', 'CBA'];
  const requestSubmitted = [40, 70, 50, 40, 90, 60, 40, 70, 80, 60, 50, 45];
  const documentsReleased = [30, 60, 20, 30, 60, 40, 20, 60, 100, 80, 60, 55];
  const backlog = [20, 40, 10, 10, 50, 30, 30, 40, 60, 20, 45, 35];

  return (
    <div className=" ">
      <div className='bgcolor'></div>
      <img
        src="/images/PLM.jpg"
        alt="Pamantasan ng Lungsod ng Maynila university logo"
        className='dashbg'
      />
      <div className='dash-bg'>
        <Header />
        <div className='dashboard-grid'>
          <div className="overview-container">
            <div className="overview-card">
              <div className="overview-left">
                <h2>Document Overview</h2>
                <p className="total-label">Total Requests</p>
                <h1 className="total-count">950</h1>
                <div className="breakdown">
                  <p>Pending <span>210</span></p>
                  <p>Processing <span>135</span></p>
                  <p>Shelf <span>240</span></p>
                </div>
              </div>

              <div className="overview-right">
                <div className="dropdown">
                  <button className="dropdown-button" onClick={() => setShowDropdown(!showDropdown)}>
                    {filter} <span className="arrow">▾</span>
                  </button>
                  {showDropdown && (
                    <div className="dropdown-menu">
                      {filters.map((option) => (
                        <button
                          key={option}
                          className="dropdown-option"
                          onClick={() => handleSelect(option)}
                          disabled={option === 'Last Year'}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
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
                  { data: requestSubmitted, label: 'Shelf', stack: 'A' },
                  { data: documentsReleased, label: 'Documents Released', stack: 'A' },
                  { data: backlog, label: 'Pending', stack: 'A' }
                ]}
                height={350}
              />
            )}
          </div>

          <div className='sum-table'>
            <TableContainer className='table' component={Paper}>
              <Table sx={{ minWidth: 0 }} aria-label="summary table">
                <TableHead>
                  <TableRow>
                    <TableCell className='table-header'>Dessert</TableCell>
                    <TableCell className='table-header' align="center">Undergraduates</TableCell>
                    <TableCell className='table-header' align="center">Graduates</TableCell>
                    <TableCell className='table-header' align="center">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell align="center">{row.Undergraduates}</TableCell>
                      <TableCell align="center">{row.Graduates}</TableCell>
                      <TableCell align="center">{row.Total}</TableCell>
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
