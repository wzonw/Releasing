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

  const filters = ['All Time', 'Last Week', 'Last Month', 'Last Year'];

  const handleSelect = (option) => {
    setFilter(option);
    setShowDropdown(false);
  };

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),
];

  return (
    <div className=" ">
      <div className='bgcolor'></div>
        <img
          src="/images/PLM.jpg"
          alt="Pamantasan ng Lungsod ng Maynila university logo displayed prominently in a dashboard interface, surrounded by a clean and professional digital environment"
          className='dashbg'
        />
      <div className='dash-bg'>
        <Header/>
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
                <p>Released <span>365</span></p>
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
        <hr></hr>

        <div className='doc-reqs'>
          <h1>Request Status</h1>
            <BarChart
            className='docs'
            xAxis={[{ data: type }]}
            series={
              type.map((label, i) => ({
                data: [val[i]],
                label,
                color: barColors[i]
              }))
            }
            height={350}
          />
        </div>

        <hr></hr>

        <div className='course-stat'>
          <BarChart className='stat'
            series={[
              { data: [4, 2, 5, 4, 1], stack: 'A', label: 'Series A1' },
              { data: [2, 8, 1, 3, 1], stack: 'A', label: 'Series A2' },
              { data: [14, 6, 5, 8, 9], label: 'Series B1' },
            ]}
            barLabel={(item, context) => {
              if ((item.value ?? 0) > 10) {
                return 'Dummy';
              }
              return context.bar.height < 60 ? null : item.value?.toString();
            }}
            height={350}
          />
        </div>

        <hr></hr>

        <div className='sum-table'>
          <TableContainer className='table' component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Dessert (100g serving)</TableCell>
                  <TableCell align="right">Calories</TableCell>
                  <TableCell align="right">Fat&nbsp;(g)</TableCell>
                  <TableCell align="right">Carbs&nbsp;(g)</TableCell>
                  <TableCell align="right">Protein&nbsp;(g)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.name}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell align="right">{row.calories}</TableCell>
                    <TableCell align="right">{row.fat}</TableCell>
                    <TableCell align="right">{row.carbs}</TableCell>
                    <TableCell align="right">{row.protein}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

      </div>
    </div>            
  );
}

export default Dashboard