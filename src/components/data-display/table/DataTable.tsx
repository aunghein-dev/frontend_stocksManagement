'use client';

import * as React from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridRowId,
  GridPaginationModel
} from '@mui/x-data-grid';
import {  Paper } from '@mui/material';


// Define a generic type for the data rows
// V will be the specific data type (e.g., Sales, Stock, Reports)
// R will be the flattened row type for the DataGrid
interface DataTableProps<V, R extends { id: GridRowId }> {
  data: V[]; // The raw data coming from the hook
  dataMapper: (data: V[]) => R[]; // Function to flatten/map raw data to GridRows
  columns: GridColDef[]; // Columns specific to the data type
  isLoading: boolean;
  error: any; // Consider a more specific error type if possible
  filterField: keyof R; // The field to use for text filtering (e.g., 'groupName', 'batchId')
  searchTextLabel: string; // Label for the search input (e.g., "Search by Group Name...")
  rowHeight?: number; // Optional row height for specific tables
  // Optional props for custom actions/buttons below the table, like the '+' link
  children?: React.ReactNode;
}

function DataTable<V, R extends { id: GridRowId }>({
  data,
  dataMapper,
  columns,
  isLoading,
  error,
  filterField,
  searchTextLabel,
  rowHeight = 55, // Default row height
  children,
}: DataTableProps<V, R>) {
  const [searchText, setSearchText] = React.useState('');
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({ page: 0, pageSize: 10 });

  // Update rows whenever the incoming data changes
  // This replaces the setTimeout simulation
  React.useEffect(() => {
    if (Array.isArray(data)) {
      setRows(dataMapper(data));
    } else {
      setRows([]); // Fallback to empty if data is undefined/null
    }
    // Reset pagination to first page when data changes (e.g., on search or refresh)
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  }, [data, dataMapper]); // dataMapper added as dependency as it's passed from parent

  // Filter rows based on searchText and filterField
    const filteredRows = React.useMemo(() => {
      if (!searchText) {
        return rows;
      }
      const lowercasedSearchText = searchText.toLowerCase();
      return rows.filter((row) => {
        const fieldValue = String(row[filterField]).toLowerCase();
        return fieldValue.includes(lowercasedSearchText);
      });
    }, [rows, searchText, filterField]);

  // Handle cell edit committed (if enabled for some columns)
  const handleEditCellChangeCommitted = React.useCallback((params: any) => {
    // In a real application, you would send this update to your backend here
    // For now, we update the local state immediately
    setRows((prev) =>
      prev.map((row) =>
        row.id === params.id ? { ...row, [params.field]: params.value } : row
      )
    );
  }, []);

  // Determine if the table should show a loading indicator
  // If `isLoading` from the hook is true OR `rows` are still empty and initial loading is not yet done
  const showLoadingOverlay = isLoading || (rows.length === 0 && !isLoading && !error);
   // Note: `rows.length === 0 && !isLoading && !error` attempts to show loading while rows are still empty post-load.
   // This might conflict with the `noRowsOverlay` if you intend to show "No Results" specifically.
   // For strict "loading spinner" only, use just `isLoading`.
   // If `isLoading` from hook also includes the time for `dataMapper` to run, then `isLoading` is sufficient.
   // The current implementation of `loading={isLoading || rows.length === 0}` in your original code
   // would show a spinner if there are no rows, even after loading is complete, which can be confusing.
   // We'll stick to `isLoading` for the MuiXDataGrid's `loading` prop for clarity.

  return (
    <div className='relative'>
      <Paper elevation={0} sx={{
        height: "calc(100dvh - 110px)",
        width: '100%', // Adjust width as needed based on parent
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 1,
        overflow: 'hidden', // Ensures inner elements don't overflow rounded corners
      }}>
       

        <DataGrid
          // The DataGrid `loading` prop from MUI should ideally only reflect `isLoading` from your hook.
          // If you want a specific "No results found" overlay, you'd use `slots` and `slotProps`.
          style={{ 
          height: "calc(100dvh - 110px)",
         }}
          className='p-1 sm:w-[calc(100vw-225px)] w-[calc(100vw-25px)]'
          loading={isLoading} // Only show MUI's built-in spinner if data is being fetched
          rows={filteredRows}
          columns={columns}
          pageSizeOptions={[5, 10, 25]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          onCellEditStop={handleEditCellChangeCommitted}
          disableRowSelectionOnClick
          showToolbar
          filterDebounceMs={300}
          rowHeight={rowHeight}
          slotProps={{
            toolbar: {
              csvOptions: {
                utf8WithBom: true, // Apply UTF-8 
              },
           },
          }}
          // The style prop can be simplified by using `sx` prop which is more idiomatic for MUI
          sx={{
          border: 0,
          borderRadius: 1,
          '& .MuiDataGrid-scrollbarFiller--header':{
            backgroundColor: '#f8f8f8',
          },
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: '#f8f8f8',
          },
         
          '& .MuiDataGrid-columnHeaderTitle ': {
            fontSize: '0.9rem',
            color: '#4b5563',
            fontWeight: 600,
          },
          '& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer': {
            fontSize: '0.9rem'
          },
          '& .MuiDataGrid-scrollbarContent': {
            backgroundColor: 'red',
            width: '0px',
            height: '0px',
          },

          '& .MuiDataGrid-scrollbar': {
            overflow: 'auto', // enable both x and y
             backgroundColor: 'white',
            // ✅ Custom scrollbar (WebKit)
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'white',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(19, 19, 19, 0.1)',
              borderRadius: '6px',
            },
            '&::-webkit-scrollbar-corner': {
              background: 'transparent', // ⬅️ This removes the bottom-right corner block
            },
          },

          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.9rem',

          },
          '& .MuiDataGrid-toolbarQuickFilter': {
            fontSize: '0.9rem',
            
            '& input': {
              fontSize: '0.9rem !important',
              borderRadius: '10px',
            },
            '& input::placeholder': {
              fontSize: '0.9rem !important',
            },
          },
           '.MuiDataGrid-columnSeparator': {
              display: 'none',
          },
          '&.MuiDataGrid-root': {
              border: 'none',
          },
          "& .MuiDataGrid-cell:focus-within": {
              outline: 'none !important'
          },
         
        }}
        
        />
      </Paper>
      {/* Any children passed to DataTable (e.g., the '+' link) */}
      {children}
    </div>
  );
}

// Use React.memo for performance optimization
export default React.memo(DataTable) as typeof DataTable;