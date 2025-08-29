'use client';

import * as React from 'react';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, Chip } from '@mui/material';
import Link from 'next/link';
import DataTable from '@/components/data-display/table/DataTable';
import { useTranslation } from '@/hooks/useTranslation';
import NextAvatar from '../ui/NextAvatar';
import { checkAvailableToCreate } from '../utils/checkBilling';

interface User {
  id: number;
  username: string;
  role: string;
  fullName: string;
  userImgUrl: string | null;

  // additional fields from TellerResponse (as strings)
  deviceName: string | null;
  deviceType: string | null;
  geoCity: string | null;
  geoRegion: string | null;
  ipAddress: string | null;
  loginAt: string;          // from Instant -> string on API
  logoutAt: string | null;  // from Instant -> string on API
  status: string;           // "ACTIVE" | "INACTIVE" (string)
  updatedAt: string;        // from Instant -> string on API
}

// Row used by DataGrid (must include `id`)
interface FlattenedUserRow {
  id: number;
  fullName: string;
  userImgUrl: string | null;
  username: string;
  role: string;

  // added to match backend
  deviceName: string | null;
  deviceType: string | null;
  geoCity: string | null;
  geoRegion: string | null;
  ipAddress: string | null;
  loginAt: string;
  logoutAt: string | null;
  status: string;
  updatedAt: string;
}

/** Map incoming users to flat rows for the grid */
const flattenUsers = (users: User[]): FlattenedUserRow[] =>
  users.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    userImgUrl: u.userImgUrl,
    username: u.username,
    role: u.role,

    deviceName: u.deviceName,
    deviceType: u.deviceType,
    geoCity: u.geoCity,
    geoRegion: u.geoRegion,
    ipAddress: u.ipAddress,
    loginAt: u.loginAt,
    logoutAt: u.logoutAt,
    status: u.status,
    updatedAt: u.updatedAt,
  }));

type UserTableProps = {
  users: User[];
  isLoading: boolean;
  error: unknown;
  expiredDate: string;
  planCode: string;
  refresh: () => void;
};

const roleColor = (role: string) => {
  const r = role.toLowerCase();
  if (['admin', 'owner', 'superadmin'].includes(r)) return { color: 'error', variant: 'outlined' } as const;
  if (['manager', 'lead'].includes(r)) return { color: 'warning', variant: 'outlined' } as const;
  if (['staff', 'user', 'member'].includes(r)) return { color: 'success', variant: 'outlined' } as const;
  return { color: 'default', variant: 'outlined' } as const;
};

const fmtDateTime = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};


const UserTable: React.FC<UserTableProps> = ({ users, isLoading, error, expiredDate, planCode }) => {
  const { t } = useTranslation();

  const columns: GridColDef<FlattenedUserRow>[] = React.useMemo(
    () => [
      // Avatar
      {
        field: 'userImgUrl',
        headerName: t('lbl_propics'),
        width: 120,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<FlattenedUserRow, string | null>) => (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <NextAvatar url={params.value ?? ''} />
          </Box>
        ),
      },
      // Full name (clickable)
      {
        field: 'fullName',
        headerName: t('lbl_fullName') ?? 'Full Name',
        flex: 1,
        minWidth: 160,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Link
            href={`/users`}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {params.row.fullName}
          </Link>
        ),
      },
      // Username
      {
        field: 'username',
        headerName: t('lbl_username') ?? 'Username',
        width: 180,
        align: 'left',
        headerAlign: 'center',
        renderCell: (params) => <span className="text-slate-600">{params.row.username}</span>,
      },
      // Role (chip)
      {
        field: 'role',
        headerName: t('lbl_role') ?? 'Role',
        width: 140,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => {
          const { color, variant } = roleColor(params.row.role);
          return <Chip label={params.row.role} size="small" color={color} variant={variant} />;
        },
      },

      // ---- Additional columns (strings) ----

      { field: 'deviceName', headerName: t('lbl_device'), width: 140, renderCell: (p) => <span>{p.row.deviceName ?? '—'}</span> },
      { field: 'deviceType', headerName: t('lbl_deviceType'), width: 120, renderCell: (p) => <span>{p.row.deviceType ?? '—'}</span> },

      { field: 'geoCity', headerName: t('lbl_city'), width: 140, renderCell: (p) => <span>{p.row.geoCity ?? '—'}</span> },
      { field: 'geoRegion', headerName: t('lbl_region'), width: 120, renderCell: (p) => <span>{p.row.geoRegion ?? '—'}</span> },

      { field: 'ipAddress', headerName: t('lbl_ipAdd'), width: 160, renderCell: (p) => <span className="truncate">{p.row.ipAddress ?? '—'}</span> },

      {
        field: 'status',
        headerName: t('lbl_status') ?? 'Status',
        width: 120,
        align: 'center',
        headerAlign: 'center',
        renderCell: (p) =>
          p.row.status === 'ACTIVE'
            ? <Chip label="Online" size="small" color="success" variant="outlined" />
            : <Chip label="Offline" size="small" color="default" variant="outlined" />,
      },

      { 
        field: 'loginAt',
        headerName: t('lbl_loginAt'),
        width: 190,
        renderCell: (p) => <span>{fmtDateTime(p.row.loginAt)}</span>
      },
      { 
        field: 'logoutAt',
        headerName: t('lbl_logoutAt'),
        width: 190,
        renderCell: (p) => <span>{fmtDateTime(p.row.logoutAt)}</span>
      },
      { 
        field: 'updatedAt',
        headerName: t('lbl_updateAt'),
        width: 170,
        renderCell: (p) => <span>{fmtDateTime(p.row.updatedAt)}</span>
      },
    ],
    [t]
  );

  return (
    <DataTable
      className="sm:w-[calc(100vw-225px)] w-[calc(100vw-25px)]"
      data={users}
      dataMapper={flattenUsers}
      columns={columns}
      isLoading={isLoading}
      error={error}
      filterField="fullName"
      searchTextLabel={t('search_users_placeholder') ?? 'Search by name...'}
      rowHeight={72}
    > 
    {
      checkAvailableToCreate(users.length, expiredDate, planCode) &&
      <button
        className="absolute bottom-20 right-5 bg-blue-100 text-blue-600 hover:bg-blue-200 px-4 py-2.5 flex justify-center items-center rounded-xl border-[0.5px] border-blue-600 ease-in-out duration-300 text-md font-semibold z-50 hover:scale-105 cursor-pointer flex-row shadow-sm hover:shadow-md">
        + {t("lbl_newTeller")}
      </button>
      }
    </DataTable>
  );
};

export default UserTable;
