'use client';

import * as React from 'react';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Stack } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import {
  IconButton
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import formatMoney from '@/components/utils/formatMoney';
import DataTable from '@/components/data-display/table/DataTable';

// Type for the raw Reports data (as provided in your code)
export interface Reports {
  batchId: string;
  totalQty: number;
  stkItemCnt: number;
  checkoutTotal: number;
  tranDate: string; // Changed to string for dayjs to parse
  tranUserEmail: string;
  bizId: number;
}

// Type for the flattened BatchReport data
interface FlattenedBatchReportRow {
  id: string; // batchId
  batchId: string; // Formatted batchId
  totalQty: number;
  stkItemCnt: number;
  checkoutTotal: number;
  tranTime: string;
  tranDate: string;
  tranUserEmail: string;
  bizId: number;
}

// Data Mapper for BatchReport
const flattenBatchReport = (reports: Reports[]): FlattenedBatchReportRow[] => {
  return reports.map((report) => ({
    id: report.batchId,
    batchId: report.batchId ? `#${report.batchId.toLocaleUpperCase().substring(0, 8)}` : 'N/A',
    totalQty: report.totalQty,
    stkItemCnt: report.stkItemCnt,
    checkoutTotal: report.checkoutTotal,
    tranTime: dayjs(report.tranDate).format('hh:mm:ss A'),
    tranDate: dayjs(report.tranDate).format('DD-MMM-YYYY'),
    tranUserEmail: report.tranUserEmail,
    bizId: report.bizId
  }));
};

const BatchReportTable: React.FC<{ items: Reports[]; isLoading: boolean; error: unknown; refresh: () => void }> = ({ items, isLoading, error }) => {
  const router = useRouter();

  const columns: GridColDef<FlattenedBatchReportRow>[] = React.useMemo(() => [
    {
      field: 'batchId',
      headerName: '#Batch',
      flex: 1,
      minWidth: 130,
      align: 'center',
      headerAlign: 'center',
       renderCell: (params: GridRenderCellParams<FlattenedBatchReportRow>) => (
                          <div
                            className={`text-blue-600 hover:text-blue-700 cursor-pointer hover:underline`}
                          >
                            {params.row.batchId}
                          </div>
                        ),
    },
    {
      field: 'totalQty',
      headerName: 'Total Qty',
      flex: 1,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<FlattenedBatchReportRow>) => (
              <div
                className="flex justify-center items-center px-3 py-1 rounded-sm text-sm font-semibold border-[0.5px] border-green-600
                          bg-green-200 text-green-800 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
              >
                {params.row.totalQty}
              </div>
            )
    },
    {
      field: 'stkItemCnt',
      headerName: 'Item Count',
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<FlattenedBatchReportRow>) => (
              <div
                className="flex justify-center items-center px-3 py-1 rounded-sm text-sm font-semibold border-[0.5px] border-indigo-500
                          bg-indigo-100 text-indigo-700 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
              >
                {params.row.stkItemCnt}
              </div>
            )
    },
    {
      field: 'checkoutTotal',
      headerName: 'Total Amount',
      flex: 1,
      minWidth: 120,
      align: 'left',
      headerAlign: 'left',
       renderCell: (params: GridRenderCellParams<FlattenedBatchReportRow>) => (
                          <div
                            className={`text-blue-500 hover:text-blue-700 cursor-pointer
                                        font-semibold bg-gray-100 text-sm rounded-sm px-2 py-1
                                        border-[0.5px] border-blue-700
                                        `}
                          >
                            {formatMoney(params.row.checkoutTotal)}
                          </div>
                        ),

    },
    {
      field: 'tranTime',
      headerName: 'Time',
      flex: 1,
      minWidth: 90,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'tranDate',
      headerName: 'Date',
      flex: 1,
      minWidth: 110,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'tranUserEmail',
      headerName: 'User',
      flex: 1,
      minWidth: 180,
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
      renderCell: ({ row }: GridRenderCellParams<FlattenedBatchReportRow>) => (
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ width: '100%' }}>
          <Tooltip title="Generate Voucher" arrow>
            <IconButton
              size="small"
              onClick={() => router.push(`/report/vouchers/generate?batchId=${row.id}`)}
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
  ], [router]); // router is a dependency of useCallback/useMemo

  return (
    <DataTable
      data={items}
      dataMapper={flattenBatchReport}
      columns={columns}
      isLoading={isLoading}
      error={error}
      filterField="batchId"
      searchTextLabel="Search by Batch ID..."
      rowHeight={55}
    >
      {/* No specific '+' button for BatchReportTable in your original code,
          so this can be empty or removed if not needed */}
    </DataTable>
  );
};

export default BatchReportTable;