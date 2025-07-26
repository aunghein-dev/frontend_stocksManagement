'use client';

import * as React from 'react';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Stack,
} from '@mui/material';
import type { Sales } from '@/data/table.data';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useModalStore } from "@/store/modalStore";
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import RemoveShoppingCartOutlinedIcon from '@mui/icons-material/RemoveShoppingCartOutlined';
import formatMoney from '@/components/utils/formatMoney';
import DataTable from '@/components/data-display/table/DataTable'; // <--- Import the reusable DataTable
import { useTranslation } from '@/hooks/useTranslation';
// Type for the flattened Sales data
interface FlattenedSalesRow {
  id: number; // tranID
  batchId: string;
  time: string;
  tranDate: string;
  groupId: number;
  groupName: string;
  itemId: number;
  checkoutQty: number;
  itemUnitPrice: number;
  subCheckout: number;
  tranUserEmail: string;
  bizId: number;
  barcodeNo: string;
}

// Data Mapper for Sales
const flattenSales = (sales: Sales[]) => {
  return sales.map((sale) => ({
    id: sale.tranID,
    batchId: sale.batchId ? `#${sale.batchId.toLocaleUpperCase().substring(0, 8)}` : 'N/A',
time: sale.tranDate ? dayjs(sale.tranDate).format('hh:mm:ss A') : 'Invalid Time',
    tranDate: dayjs(sale.tranDate).format('DD-MMM-YYYY'),
    groupId: sale.stkGroupId,
    groupName: sale.stkGroupName,
    itemId: sale.stkItemId,
    checkoutQty: sale.checkoutQty,
    itemUnitPrice: sale.itemUnitPrice,
    subCheckout: sale.subCheckout,
    tranUserEmail: sale.tranUserEmail,
    bizId: sale.bizId,
    barcodeNo: sale.barcodeNo
  }));
};

// SalesTable component will now just define its specific columns and props for DataTable
const SalesTable: React.FC<{ sales: Sales[]; isLoading: boolean; error: unknown; refresh: () => void }> = ({ sales, isLoading, error }) => {
  const openModal = useModalStore((s) => s.openModal);
  const { t } = useTranslation();
  const handleCancel = React.useCallback((oldTranId: number, oldQty: number, itemId: number, groupName: string) => {
    openModal("cancelBatch", { oldTranId, oldQty, itemId, groupName });
  }, [openModal]); // openModal is stable from zustand, but good practice to include

  const handleRefund = React.useCallback((oldTranId: number, oldQty: number, itemId: number, groupName: string) => {
    openModal("refundBatch", { oldTranId, oldQty, itemId, groupName });
  }, [openModal]); // openModal is stable from zustand, but good practice to include

  const columns: GridColDef[] = React.useMemo(() => [
    {
      field: 'batchId',
      headerName: t("tb_batch"),
      width: 130,
      align: 'center',
      headerAlign: 'center',
       renderCell: (params: GridRenderCellParams<FlattenedSalesRow>) => (
                    <div
                      className={`text-blue-600 hover:text-blue-700 cursor-pointer hover:underline`}
                    >
                      {params.row.batchId}
                    </div>
                  ),
    },
    {
      field: 'time',
      headerName: t("tb_time"),
      width: 100,
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'tranDate',
      headerName: t("tb_date"),
      width: 100,
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'groupId',
      headerName: t("tb_groupId"),
      width: 90,
      align: 'center',
      headerAlign: 'center',
       renderCell: (params: GridRenderCellParams<FlattenedSalesRow>) => (
                    <div
                      className={`text-blue-600 hover:text-blue-700 cursor-pointer`}
                    >
                      G-{params.row.groupId}
                    </div>
                  ),
    },
      {
      field: 'itemId',
      headerName: t("tb_itemId"),
      width: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<FlattenedSalesRow>) => (
                    <div
                      className={`text-blue-600 hover:text-blue-700 cursor-pointer`}
                    >
                      G-{params.row.itemId}
                    </div>
                  ),
    },

    {
      field: 'groupName',
      headerName: t("tb_groupName"),
      flex: 1,
      minWidth: 170,
      align: 'left',
      headerAlign: 'center',
    },
  
    {
      field: 'checkoutQty',
      headerName: t("tb_qty"),
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<FlattenedSalesRow>) => (
        <div
          className="flex justify-center items-center px-3 py-1 rounded-xs text-sm font-semibold border-[0.5px] border-green-500
                    bg-green-100 text-green-700 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
        >
          {params.row.checkoutQty}
        </div>
      )
    },
    {
      field: 'itemUnitPrice',
      headerName: t("tb_price"),
      type: 'number',
      width: 100,
      align: 'left',
      headerAlign: 'left',
    },
    {
      field: 'subCheckout',
      headerName: t("tb_subAmt"),
      width: 120,
      align: 'left',
      headerAlign: 'left',
      renderCell: (params: GridRenderCellParams<FlattenedSalesRow>) => (
                    <div
                      className={`text-blue-600 hover:text-blue-700 cursor-pointer
                                  font-semibold bg-gray-100 text-sm rounded-xs px-2 py-1
                                  border-[0.5px] border-blue-700
                                  `}
                    >
                      {formatMoney(params.row.subCheckout)}
                    </div>
                  ),
    },
  
    {
      field: 'tranUserEmail',
      headerName: t("tb_teller"),
      width: 180,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'actions',
      headerName: t("tb_actions"),
      width: 130,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<FlattenedSalesRow>) => (
        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ width: '100%' }}>
          {/* Refund Button */}
          <Tooltip title="Refund Quantity" arrow>
            <IconButton
              size="small"
              aria-label="Refund"
              onClick={() =>
                handleRefund(
                  params.row.id, // tranID is the id
                  params.row.checkoutQty,
                  params.row.itemId,
                  params.row.groupName
                )
              }
              sx={{
                color: '#d97706', // amber-600
                backgroundColor: '#fef3c7', // amber-50
                border: '1px solid #f59e0b', // amber-500
                '&:hover': {
                  backgroundColor: '#fde68a', // amber-100
                  transform: 'scale(1.08)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <ReplayOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Cancel Button */}
          <Tooltip title="Cancel Checkout" arrow>
            <IconButton
              size="small"
              aria-label="Cancel"
              onClick={() =>
                handleCancel(
                  params.row.id, // tranID is the id
                  params.row.checkoutQty,
                  params.row.itemId,
                  params.row.groupName
                )
              }
              sx={{
                color: '#dc2626', // red-600
                backgroundColor: '#fee2e2', // red-100
                border: '1px solid #ef4444', // red-500
                '&:hover': {
                  backgroundColor: '#fecaca', // red-200
                  transform: 'scale(1.08)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <RemoveShoppingCartOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ], [t, handleRefund, handleCancel]); // Dependencies for useCallback functions

  return (
    <DataTable
      className='sm:w-[calc(100vw-225px)] w-[calc(100vw-25px)]'
      data={sales}
      dataMapper={flattenSales}
      columns={columns}
      isLoading={isLoading}
      error={error}
      filterField="groupName" // Field to filter by
      searchTextLabel="Search by Group Name..."
      rowHeight={50}
    >
      {/* Plus button for sales table, if applicable, otherwise remove */}
    <Link
        href="/"
        className="absolute bottom-20 right-5 bg-blue-100 text-blue-600 hover:bg-blue-200 px-4 py-2.5 flex justify-center items-center rounded-full border-[0.5px] border-blue-600 ease-in-out duration-300 text-md font-semibold z-50 hover:scale-105 cursor-pointer flex-row shadow-sm hover:shadow-md"
      >
        + {t("btnTxt_newSale")}
    </Link>
    </DataTable>
  );
};

export default SalesTable;