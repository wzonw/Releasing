import './Monitor.css';

function Monitor() {
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
            Start
            <div className='monitor-container'>
                List
            </div>
            End
        </div>
    </div>
  )
}

export default Monitor