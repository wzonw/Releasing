import React from 'react';

function Login() {
  return (
    // Added border-t-8, border-b-8, and border-blue-900 to the main container
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center font-sans text-gray-800 border-t-30 border-b-30 border-blue-900">

      {/* Header */}
      <div className="flex flex-col items-center text-center -mt-20 mb-20">
  <img src="plm_logo.png" alt="PLM Logo" className="w-12 h-12 mb-1" />
  <h1 className="text-sm font-semibold">PAMANTASAN NG LUNGSOD NG MAYNILA</h1>
  <p className="text-xs">Intramuros, Manila</p>
  <h2 className="text-md font-semibold text-blue-800 mt-1 tracking-wide">
    OUR MANAGEMENT SYSTEM (OMS)
  </h2>
  </div>

      {/* Main Card Section */}
      <div className="bg-white rounded-xl flex w-[800px] max-w-full justify-between p-8 gap-6 shadow-lg">
        {/* Sign In Form */}
        <div className="w-1/2 border border-gray-300 rounded-lg px-6 py-4 flex flex-col justify-center">
          <h3 className="text-center text-lg font-semibold mb-4">SIGN IN</h3>
          <input
            type="text"
            placeholder="Username"
            className="mb-3 px-4 py-2 border rounded-md"
          />
          <input
            type="password"
            placeholder="Password"
            className="mb-3 px-4 py-2 border rounded-md"
          />
          <button className="bg-blue-900 text-white py-2 rounded-md hover:bg-blue-800">
            LOGIN
          </button>
          <button
            type="button"
            className="text-red-500 text-center mt-2 text-sm underline"
            onClick={() => alert('Redirecting to Help Page')}
          >
            Need Help?
          </button>
        </div>

        {/* Releasing Window */}
        <div className="w-1/2 border border-gray-300 rounded-lg px-6 py-4 shadow-md">
          <h4 className="text-blue-900 font-semibold text-sm mb-4">RELEASING WINDOW</h4>
          <div className="text-sm space-y-1">
            <p>
              <strong>CATEGORY:</strong> Undergraduate - Graduating Students
            </p>
            <p>
              <strong>ACADEMIC YEAR:</strong> 2024 - 2025
            </p>
            <p>
              <strong>SEM:</strong> 2nd
            </p>
            <p>
              <strong>START DATE:</strong>{' '}
              <span className="text-red-600">May 19, 2025 1:00 AM</span>
            </p>
            <p>
              <strong>END DATE:</strong>{' '}
              <span className="text-red-600">May 25, 2025 11:59 PM</span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-6 text-sm text-red-500">
        Today is <strong>Friday, Feb 28, 2025</strong>
      </p>
    </div>
  );
}

export default Login;