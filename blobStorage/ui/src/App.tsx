import { Button } from 'primereact/button'
import './App.css'
import FileUploadComponent from './components/FileUploadComponent'
import ListBlobs from './components/ListBlobs'
import { useRef, useState } from 'react'
import { Toast } from 'primereact/toast'

function App() {
  const [blobs, setBlobs] = useState([])
  const toast = useRef(null);

  const handleFetch = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/list');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Fetched blobs:', data);
      setBlobs(data.blobs);
    } catch (error) {
      console.error('Error fetching blobs:', error);
    }
  }
  return (
    <>
    <Toast ref={toast} />
      <div className='flex align-items-center gap-2 mb-3'>
        <h4 className='m-0'>Azure File Upload Example</h4>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" height="20" width="20">
          <defs>
            <linearGradient id="aa32ebca-eeba-4b3a-9ee4-7e15a794a5d5" x1="9" y1="15.799" x2="9" y2="5.316" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#32bedd" />
              <stop offset="0.775" stopColor="#32d4f5" />
            </linearGradient>
          </defs>
          <title>MsPortalFx.base.images-2</title>
          <g id="a9342976-9512-4674-89f1-52a588cf420b">
            <g>
              <path d="M.544,5.316H17.456a0,0,0,0,1,0,0v9.918a.565.565,0,0,1-.565.565H1.109a.565.565,0,0,1-.565-.565V5.316A0,0,0,0,1,.544,5.316Z" fill="url(#aa32ebca-eeba-4b3a-9ee4-7e15a794a5d5)" />
              <path d="M1.112,2.2H16.888a.565.565,0,0,1,.565.565v2.55a0,0,0,0,1,0,0H.547a0,0,0,0,1,0,0V2.766A.565.565,0,0,1,1.112,2.2Z" fill="#0078d4" />
              <path d="M13.528,7.347H9.384A.228.228,0,0,1,9.26,7.31L8.077,6.523a.218.218,0,0,0-.123-.038H4.472a.222.222,0,0,0-.222.222v7.315a.221.221,0,0,0,.222.222h9.056a.221.221,0,0,0,.222-.222V7.569A.222.222,0,0,0,13.528,7.347Z" fill="#f78d1e" />
              <rect x="5.114" y="6.91" width="2.159" height="0.432" rx="0.091" fill="#fff" />
              <rect x="5.114" y="6.91" width="0.432" height="0.432" rx="0.062" fill="#d15900" />
              <path d="M13.528,7.337H8.977A.219.219,0,0,0,8.82,7.4l-.732.731a.22.22,0,0,1-.157.066H4.472a.221.221,0,0,0-.222.221v5.591a.221.221,0,0,0,.222.222h9.056a.221.221,0,0,0,.222-.222V7.558A.221.221,0,0,0,13.528,7.337Z" fill="#fff" />
            </g>
          </g>
        </svg>
      </div>

      <FileUploadComponent onUploadComplete={handleFetch} />
      <div className='flex align-items-center gap-2 mt-2'>
        <Button label="Fetch" icon="pi pi-refresh" className='mb-2' onClick={handleFetch} />
      </div>
      <ListBlobs blobs={blobs} onDeleteSuccess={handleFetch}/>

    </>
  )
}

export default App
