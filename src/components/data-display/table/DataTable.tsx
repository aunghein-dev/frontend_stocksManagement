'use client';

import * as React from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridRowId,
  GridPaginationModel,
  GridCellEditStopParams
} from '@mui/x-data-grid';
import {  Paper } from '@mui/material'; // Make sure to import these if you use them for the search input


// Define a generic type for the data rows
// V will be the specific data type (e.g., Sales, Stock, Reports)
// R will be the flattened row type for the DataGrid
interface DataTableProps<V, R extends { id: GridRowId }> {
  data: V[]; // The raw data coming from the hook
  dataMapper: (data: V[]) => R[]; // Function to flatten/map raw data to GridRows
  columns: GridColDef[]; // Columns specific to the data type
  isLoading: boolean;
  error: unknown; // Consider a more specific error type if possible
  filterField: keyof R | Array<keyof R>; // FIXED: The field(s) to use for text filtering
  searchTextLabel: string; // Label for the search input (e.g., "Search by Group Name...")
  rowHeight?: number; // Optional row height for specific tables
  // Optional props for custom actions/buttons below the table, like the '+' link
  children?: React.ReactNode;
  className?: string; // Prop for external classes
}

function DataTable<V, R extends { id: GridRowId }>({
  data,
  dataMapper,
  columns,
  isLoading,
  filterField,
  rowHeight = 55, // Default row height
  children,
  className = '', // Default empty string for className
}: DataTableProps<V, R>) {
  const [searchText] = React.useState(''); // Assuming an input updates this
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({ page: 0, pageSize: 10 });


  React.useEffect(() => {
    if (Array.isArray(data)) {
      setRows(dataMapper(data));
    } else {
      setRows([]); // Fallback to empty if data is undefined/null
    }
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  }, [data, dataMapper, paginationModel.pageSize]);

  const filteredRows = React.useMemo(() => {
    if (!searchText) {
      return rows;
    }
    const lowercasedSearchText = searchText.toLowerCase();

    if (Array.isArray(filterField)) {
      return rows.filter((row) => {
        return filterField.some((field) => {
          const fieldValue = String(row[field as keyof typeof row]).toLowerCase();
          return fieldValue.includes(lowercasedSearchText);
        });
      });
    } else {
      return rows.filter((row) => {
        const fieldValue = String(row[filterField as keyof typeof row]).toLowerCase();
        return fieldValue.includes(lowercasedSearchText);
      });
    }
  }, [rows, searchText, filterField]);

  const handleEditCellChangeCommitted = React.useCallback((params: GridCellEditStopParams) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === params.id ? { ...row, [params.field]: params.value } : row
      )
    );
  }, []);

 return (
    // Outer div for general layout/positioning, but NOT for scrolling.
    // It should contain the Paper component.
    <div className={`relative ${className}`}>
      <Paper
        elevation={0}
        sx={{
          // Set a fixed height for the Paper. This is the container that will hold the scrollable DataGrid.
          height: 'calc(100dvh - 112px)', // This calculates height relative to viewport
          width: '100%',
          display: 'flex',       // Make Paper a flex container
          flexDirection: 'column', // Stack children vertically
          borderRadius: '0.5rem',
          overflow: 'hidden',    // IMPORTANT: Prevents Paper itself from showing a scrollbar
                                 // and clips any overflow from its direct children if they
                                 // somehow exceed Paper's dimensions.
          // Optional: If you want the Paper's background to be explicitly transparent
          // to see content behind it, add this. Otherwise, it will default to white.
          // backgroundColor: 'transparent',
        }}
      >
        {/* Optional Search Input - Uncomment and connect props if needed */}
        {/*
        <Box sx={{ p: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder={searchTextLabel}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: {
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                '& input': { fontSize: '0.9rem' },
                '& input::placeholder': { fontSize: '0.9rem' },
              }
            }}
          />
        </Box>
        */}

        <DataGrid
          // DataGrid will now take its height from `flexGrow: 1` within the Paper flex container.
          // `className` here can be used for tailwind padding/margin, or you can use sx prop.
          // Removed `className={`p-1`}` from here as it's common to control spacing via Box/sx props around DataGrid if needed.
          loading={isLoading}
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
                utf8WithBom: true,
              },
           },
          }}
          sx={{
            flexGrow: 1, // Allows DataGrid to fill remaining vertical space within its flex parent (Paper)
            width: '100%', // Ensure DataGrid takes 100% of its parent's width
            border: 0,
            borderRadius: 0,

            // Ensure the main DataGrid background is transparent for the scrollbar track to show through
            '&.MuiDataGrid-root': {
                border: 'none',
                backgroundColor: 'transparent', // Crucial for track transparency
            },
            // The MuiDataGrid-main div usually wraps the scroller and other parts.
            // Make sure its background doesn't block transparency.
            '& .MuiDataGrid-main': {
                backgroundColor: 'transparent',
            },

            // Header specific styles
            '& .MuiDataGrid-scrollbarFiller--header':{
              backgroundColor: '#f8f8f8', // Kept this background for the header filler
            },
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: '#f8f8f8', 
             
            },
            '& .MuiDataGrid-columnHeaderTitle ': {
              fontSize: '0.85rem',
              color: '#4b5563',
              fontWeight: 600,
            },
            '& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer': {
              fontSize: '0.9rem'
            },
            //  toolbar/quick filter styles
            '& .MuiDataGrid-toolbarQuickFilter': {
              fontSize: '0.9rem',
              '& input': {
                fontSize: '0.9rem !important',
                borderRadius: '0.5rem',
              },
              '& input::placeholder': {
                fontSize: '0.9rem !important',
              },
            },

            // --- PRO LEVEL MINIMALIST BLUE-300 SCROLLBAR STYLES (Even Lower Opacity) ---
            // These values now match the last custom-scrollbar CSS provided.
            '& .MuiDataGrid-virtualScroller': {
              backgroundColor: 'transparent', // Ensure the scroller itself is transparent
              scrollbarWidth: 'thin', /* Firefox */
              scrollbarColor: 'rgba(147, 197, 253, 0.2) transparent', /* Firefox: thumb (very low opacity) */

              '&::-webkit-scrollbar': {
                width: '8px',   /* Standard width */
                height: '8px',  /* For horizontal scrollbars */
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent', /* Fully transparent track */
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(147, 197, 253, 0.3)', /* Very faint blue thumb */
                borderRadius: '0.5rem', /* Slightly more rounded */
                border: '0.5px solid rgba(147, 197, 253, 0.05)', /* Barely visible border */
                transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: 'rgba(147, 197, 253, 0.5)', /* Softer blue on hover */
                borderColor: 'rgba(147, 197, 253, 0.2)', /* Very subtle border on hover */
              },
              '&::-webkit-scrollbar-corner': {
                background: 'transparent',
              },
            },

            // --- HIDE THE DEFAULT MUI SCROLLBAR (Crucial for avoiding duplicates) ---
            '& .MuiDataGrid-scrollbar': {
              display: 'none !important',
              width: '0px !important',
              height: '0px !important',
              overflow: 'hidden !important',
            },

            // Other general DataGrid cell/border styles
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.9rem',
            },
             '.MuiDataGrid-columnSeparator': {
                display: 'none',
            },
            // '&.MuiDataGrid-root' border: 'none' moved above
            "& .MuiDataGrid-cell:focus-within": {
                outline: 'none !important'
            },
                        // Example if you find MuiDataGrid-overlay is the culprit
            '& .MuiDataGrid-overlay': {
                backgroundColor: 'transparent !important',
            },
          }}
        />
      </Paper>
      {children} {/* Renders any children passed to MyDataTable outside the Paper */}
    </div>
  );
};


export default React.memo(DataTable) as typeof DataTable;