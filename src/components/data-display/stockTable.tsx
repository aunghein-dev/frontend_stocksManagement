'use client';

import * as React from 'react';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Box,
  IconButton,
  Stack,
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import type { Stock } from '@/types/stock.types';
import dayjs from 'dayjs';
import Link from 'next/link';
import ImageAvatar from '@/components/ui/imageAvatar';
import { useRouter } from 'next/navigation';

import DataTable from '@/components/data-display/table/DataTable';
import { useModalStore } from '@/store/modalStore';
import formatMoney from '@/components/utils/formatMoney';
import { useTranslation } from '@/hooks/useTranslation';

// Type for the flattened Stock data
interface FlattenedStockRow {
  itemColorHex: string;
  groupImage: string;
  itemImage: string;
  itemId: string; // 'I-itemId'
  id: string; // 'groupId-itemId' for unique id
  groupId: number;
  groupName: string;
  groupUnitPrice: number;
  releasedDate: string;
  itemQuantity: number;
  barcodeNo: string;
}

// Data Mapper for Stocks
const flattenStocks = (stocks: Stock[]): FlattenedStockRow[] => {
  return stocks.flatMap((stock) =>
    stock.items.map((item) => ({
      itemColorHex: item.itemColorHex,
      groupImage: stock.groupImage,
      itemImage: item.itemImage,
      itemId: `I-${item.itemId}`,
      id: `${stock.groupId}-${item.itemId}`, // Unique ID for DataGrid
      groupId: stock.groupId,
      groupName: stock.groupName,
      groupUnitPrice: stock.groupUnitPrice,
      releasedDate: dayjs(stock.releasedDate).format('DD-MMM-YYYY'),
      itemQuantity: item.itemQuantity,
      barcodeNo: item.barcodeNo,
    }))
  );
};

const StockTable: React.FC<{ items: Stock[]; isLoading: boolean; error: unknown; refresh: () => void }> = ({ items, isLoading, error }) => {
  const router = useRouter();

  const { t } = useTranslation();
  const openModal = useModalStore((s) => s.openModal);

  const handleDelete = React.useCallback(( itemId: string,
                                           groupName: string,
                                           groupId: number,) => {
    openModal("stkDeleteConfirmation", {  itemId, groupName, groupId });
  }, [openModal]); // Added openModal to dependency array for useCallback

  const handleEdit = React.useCallback((groupId: number) => {
    router.push(`/inventory/stocks/edit/${groupId}`); // Assuming edit is by groupId
  }, [router]);

  const columns: GridColDef<FlattenedStockRow>[] = React.useMemo(() => [
      { 
      field: 'groupId', 
      headerName: t("tb_groupId"), 
      width: 80, 
      align: 'center', 
      headerAlign: 'center' ,
      renderCell: (params: GridRenderCellParams<FlattenedStockRow>) => (
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
       renderCell: (params: GridRenderCellParams<FlattenedStockRow>) => (
              <div
                className={`text-blue-600 hover:text-blue-700 cursor-pointer
                            `}
              >
                {params.row.itemId}
              </div>
            ),
    },
        {
      field: 'barcodeNo',
      headerName: t("tb_barcodeNo"),
      width: 90,
      align: 'center',
      headerAlign: 'center',
       renderCell: (params: GridRenderCellParams<FlattenedStockRow>) => (
              <div
                className={`text-red-600 hover:text-red-700 cursor-pointer
                            `}
              >
                {params.row.barcodeNo}
              </div>
            ),
    },
    {
      field: 'releasedDate',
      headerName: t("lbl_releasedDate"),
      width: 100,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'itemColorHex',
      headerName: t("lbl_color"),
      width: 70,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<FlattenedStockRow>) => (
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            backgroundColor: params.value,
            border: '1px solid #ddd',
            mx: 'auto',
          }}
        />
      ),
    },
    
   
     {
      field: 'groupName',
      headerName: t("lbl_groupNn"),
      flex: 1,
      minWidth: 160,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'groupImage',
      headerName: t("lbl_gpImg"),
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<FlattenedStockRow>) => {
        // --- FIX FOR MUI X-DATA-GRID V5 (or older) ---
        const sortedRowIds = params.api.getSortedRowIds();
        const visibleRowIndex = sortedRowIds.indexOf(params.id);
        // --- END FIX ---

        return (
          <ImageAvatar
            src={params.value}
            // Prioritize images in the first few rows (e.g., < 3)
            // Adjust '3' based on how many rows are typically visible above the fold
            priority={visibleRowIndex !== -1 && visibleRowIndex < 3} // Add check for -1 in case ID not found
          />
        );
      },
    },
    {
      field: 'itemImage',
      headerName: t("tb_itemImage"),
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<FlattenedStockRow>) => {
        // --- FIX FOR MUI X-DATA-GRID V5 (or older) ---
        const sortedRowIds = params.api.getSortedRowIds();
        const visibleRowIndex = sortedRowIds.indexOf(params.id);
        // --- END FIX ---

        return (
          <ImageAvatar
            src={params.value}
            // Also prioritize item images in the first few rows
            priority={visibleRowIndex !== -1 && visibleRowIndex < 3} // Add check for -1 in case ID not found
          />
        );
      },
    },
    {
      field: 'groupUnitPrice',
      headerName: t("lbl_unitPrice"),
      type: 'number',
      width: 100,
      editable: false,
      align: 'left',
      headerAlign: 'left',
        renderCell: (params: GridRenderCellParams<FlattenedStockRow>) => (
              <div
                className={`text-blue-600 hover:text-blue-700 cursor-pointer
                            font-semibold bg-gray-100 text-sm rounded-sm px-2 py-1
                            border-[0.5px] border-blue-700
                            `}
              >
                {formatMoney(params.row.groupUnitPrice)}
              </div>
            ),
    },
    {
      field: 'itemQuantity',
      headerName: t("lbl_qty"),
      width: 80,
      editable: true,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<FlattenedStockRow>) => (
              <div
                className={`flex justify-center items-center px-3 py-1 
                            rounded-sm text-sm font-semibold border-[0.5px] 
                            ${params.row.itemQuantity === 0 ? 
                              'border-red-500 bg-red-100 text-red-700' : 
                              'border-green-500 bg-green-100 text-green-700'} 
                            shadow-sm hover:shadow-md transition-shadow
                            duration-200 cursor-pointer`}
              >
                {params.row.itemQuantity}
              </div>
            ),
    },
  
    {
      field: 'actions',
      headerName: t("tb_actions"),
      width: 120,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<FlattenedStockRow>) => (
        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ width: '100%' }}>
          {/* Edit Button */}
          <Tooltip title="Edit" arrow>
            <IconButton
              aria-label="Edit"
              size="small"
              color="primary"
              sx={{
                bgcolor: 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.1)',
                  transform: 'scale(1.08)',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
              onClick={() => handleEdit(params.row.groupId)}
            >
              <ModeEditOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Delete Button */}
          <Tooltip title="Delete" arrow>
            <IconButton
              aria-label="Delete"
              size="small"
              color="error"
              sx={{
                bgcolor: 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(211, 47, 47, 0.1)',
                  transform: 'scale(1.08)',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
              onClick={() => handleDelete(
                params.row.itemId,
                params.row.groupName,
                params.row.groupId
                )}
            >
              <DeleteForeverOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ], [handleEdit, handleDelete, t]); // Ensure handleEdit and handleDelete are in dependencies

  return (
    <DataTable
      className='sm:w-[calc(100vw-225px)] w-[calc(100vw-25px)]'
      data={items}
      dataMapper={flattenStocks}
      columns={columns}
      isLoading={isLoading}
      error={error}
      filterField="groupName"
      searchTextLabel="Search by Group Name..."
      rowHeight={75} // Specific row height for StockTable
    >
    <Link
      href="/inventory/stocks/new"
      className="absolute bottom-20 right-5 bg-blue-100 text-blue-600 hover:bg-blue-200 px-4 py-2.5 flex justify-center items-center rounded-sm border-[0.5px] border-blue-600 ease-in-out duration-300 text-md font-semibold z-50 hover:scale-105 cursor-pointer flex-row shadow-sm hover:shadow-md "
    >
      + {t("btnTxt_newStk")}
    </Link>

    </DataTable>
  );
};

export default StockTable;