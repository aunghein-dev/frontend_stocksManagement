"use client";
import * as React from 'react';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/data-display/table/DataTable';
import { Stack } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import {
  IconButton
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';


export interface CustomerReports {
   cid: string;
   name: string;
   typeOfCustomer: string;
   township: string;
   city: string;
   boughtCnt: number;
   boughtAmt: number;
   customerDueAmt: number;
   customerLastDueDate: Date;
   lastShopDate: Date;
   lastShopInvoice: string;
   bizId: number;
}

export interface FlattenedBatchCustomerRow {
   id: string; 
   cid: string;
   name: string;
   typeOfCustomer: string;
   township: string;
   city: string;
   boughtCnt: number;
   boughtAmt: number;
   customerDueAmt: number;
   customerLastDueDate: Date;
   lastShopDate: Date;
   lastShopInvoice: string;
   bizId: number;
}
const flattenBatchCustomerReport = (customers: CustomerReports[]): FlattenedBatchCustomerRow[] => {
  return customers.map((customer) => ({
    id: customer.cid, // Map cid to id
    cid: customer.cid,
    name: customer.name,
    typeOfCustomer: customer.typeOfCustomer,
    township: customer.township,
    city: customer.city,
    boughtCnt: customer.boughtCnt,
    boughtAmt: customer.boughtAmt,
    customerDueAmt: customer.customerDueAmt,
    customerLastDueDate: customer.customerLastDueDate,
    lastShopDate: customer.lastShopDate,
    lastShopInvoice: customer.lastShopInvoice,
    bizId: customer.bizId
  }));
};

const CustomerTable:  React.FC<{ 
    customers: CustomerReports[]; 
    isLoading: boolean; error: unknown; 
    refresh: () => void;
    handleNewCustomer: () => void; }> = ({ customers, isLoading, error, handleNewCustomer }) => {
  const router = useRouter();
const columns: GridColDef<FlattenedBatchCustomerRow>[] = React.useMemo(() => [
    {
      field: 'cid',
      headerName: 'CID',
      flex: 1,
      minWidth: 80,
      align: 'center',
      headerAlign: 'center',
       renderCell: (params: GridRenderCellParams<FlattenedBatchCustomerRow>) => (
                          <div
                            className={`text-blue-600 hover:text-blue-700 cursor-pointer hover:underline`}
                          >
                            {params.row.cid}
                          </div>
                        ),
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<FlattenedBatchCustomerRow>) => (
              <div
                className="flex justify-center items-center px-3 py-1 rounded-sm text-sm font-semibold border-[0.5px] border-green-600
                          bg-green-200 text-green-800 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
              >
                {params.row.name}
              </div>
            )
    },
    {
      field: 'typeOfCustomer',
      headerName: 'Type',
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<FlattenedBatchCustomerRow>) => (
              <div
                className="flex justify-center items-center px-3 py-1 rounded-sm text-sm font-semibold border-[0.5px] border-indigo-500
                          bg-indigo-100 text-indigo-700 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
              >
                {params.row.typeOfCustomer}
              </div>
            )
    },
    {
      field: 'township',
      headerName: 'Township',
      flex: 1,
      minWidth: 120,
      align: 'left',
      headerAlign: 'left',
       renderCell: (params: GridRenderCellParams<FlattenedBatchCustomerRow>) => (
                          <div
                            className={`text-blue-500 hover:text-blue-700 cursor-pointer
                                        font-semibold bg-gray-100 text-sm rounded-sm px-2 py-1
                                        border-[0.5px] border-blue-700
                                        `}
                          >
                            {params.row.township}
                          </div>
                        ),

    },
    {
      field: 'city',
      headerName: 'City',
      flex: 1,
      minWidth: 90,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'boughtCnt',
      headerName: 'Bought Cnt',
      flex: 1,
      minWidth: 110,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'boughtAmt',
      headerName: 'Bought Amt',
      flex: 1,
      minWidth: 110,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'customerDueAmt',
      headerName: 'Customer DueAmt',
      flex: 1,
      minWidth: 110,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'customerLastDueDate',
      headerName: 'Customer Last DueDate',
      flex: 1,
      minWidth: 110,
      align: 'center',
      headerAlign: 'center',
        // Example: Formatting Date if it's a Date object
        renderCell: (params: GridRenderCellParams<FlattenedBatchCustomerRow>) => (
            params.value ? new Date(params.value).toLocaleDateString() : ''
        ),
    },
    {
      field: 'lastShopDate',
      headerName: 'Last Shop Date',
      flex: 1,
      minWidth: 110,
      align: 'center',
      headerAlign: 'center',
       // Example: Formatting Date if it's a Date object
        renderCell: (params: GridRenderCellParams<FlattenedBatchCustomerRow>) => (
            params.value ? new Date(params.value).toLocaleDateString() : ''
        ),
    },
    {
      field: 'lastShopInvoice',
      headerName: 'Last Shop Invoice',
      flex: 1,
      minWidth: 110,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 100,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }: GridRenderCellParams<FlattenedBatchCustomerRow>) => (
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ width: '100%' }}>
          <Tooltip title="Generate Voucher" arrow>
            <IconButton
              size="small"
              // Corrected: Using row.cid instead of row.id
              onClick={() => router.push(`/sales/report/vouchers/generate?customerId=${row.cid}`)}
              sx={{
                color: '#2563eb',
                backgroundColor: '#dbeafe',
                border: '1px solid #3b82f6',
                '&:hover': { backgroundColor: '#bfdbfe' },
              }}
            >
              <ReceiptLongIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    },
  ], [router]);

  return (
    <DataTable
      className='w-full'
      data={customers}
      dataMapper={flattenBatchCustomerReport}
      columns={columns}
      isLoading={isLoading}
      error={error}
      filterField="cid"
      searchTextLabel="Search by CustomerID..."
      rowHeight={55}
    >
      <button
        onClick={handleNewCustomer}
        className="absolute top-2.5 left-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 px-4 py-2.5 flex justify-center items-center rounded-full border-[0.5px] border-blue-600 ease-in-out duration-300 text-md font-semibold z-50 hover:scale-105 cursor-pointer flex-row shadow-sm hover:shadow-md"
      >
        + New
      </button>
    </DataTable>
  );
};

export default CustomerTable;