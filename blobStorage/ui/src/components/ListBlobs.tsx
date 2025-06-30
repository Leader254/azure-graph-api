
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { useRef } from 'react';

export default function ListBlobs({ blobs, onDeleteSuccess }) {
        const toast = useRef(null);

    const formatName = (rowData: any) => {
        const name = rowData.name;
        const parts = name.split('-');
        // const lastPart = parts[parts.length - 1];
        const lastPart = parts.slice(-1)[0];
        return (
            <div className="flex align-items-center gap-2">
                <i className="pi pi-file" style={{ fontSize: '2rem' }}></i>
                <span>{lastPart}</span>
            </div>
        );
    }

    const formatDate = (rowData: any) => {
        const date = new Date(rowData.properties.createdOn);
        return date.toLocaleDateString();
    }

    const handleDelete = async (name: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/delete/${name}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            if (data.message == 'Blob deleted successfully') {
                // toast.current.show({ severity: 'success', summary: 'Success', detail: 'Blob deleted successfully' });
                onDeleteSuccess();
            }

        }
        catch (error) {
            console.error('Error deleting blob:', error);
        }
    }
    return (
        <div className="card">

            <DataTable value={blobs} paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} tableStyle={{ minWidth: '50rem' }}>
                <Column body={formatName} header="Name" style={{ width: '25%' }}></Column>
                <Column field="properties.accessTier" header="AccessTier" style={{ width: '25%' }}></Column>
                <Column field="properties.blobType" header="BlobType" style={{ width: '25%' }}></Column>
                <Column field="properties.contentType" header="ContentType" style={{ width: '25%' }}></Column>
                <Column body={formatDate} header="CreatedOn" style={{ width: '25%' }}></Column>
                {/* delete button */}
                <Column body={(rowData) => <Button severity="danger" onClick={() => handleDelete(rowData.name)}>Delete</Button>} header="Actions" style={{ width: '25%' }}></Column>
            </DataTable>
        </div>
    );
}
